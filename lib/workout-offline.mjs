const DATABASE = "tmfit-workouts";
const CHANGE_EVENT = "tmfit-workout-local-change";
let connection;
let sender;

function openDatabase() {
  if (connection) return connection;
  connection = new Promise((resolve, reject) => {
    const request = globalThis.indexedDB.open(DATABASE, 1);
    let blocked = false;
    request.onupgradeneeded = () => {
      request.result.createObjectStore("account");
      const workouts = request.result.createObjectStore("workouts", { keyPath: "key" });
      workouts.createIndex("userId", "userId");
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () => {
      blocked = true;
      reject(new Error("IndexedDB is blocked"));
    };
    request.onsuccess = () => {
      const db = request.result;
      if (blocked) return db.close();
      db.onclose = db.onversionchange = () => {
        connection = undefined;
        db.close();
      };
      resolve(db);
    };
  }).catch((error) => {
    connection = undefined;
    throw error;
  });
  return connection;
}

async function transaction(storeName, mode, run) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    let result;
    let failure;
    tx.oncomplete = () => resolve(result);
    tx.onabort = () => reject(failure || tx.error || new Error("IndexedDB transaction aborted"));
    const store = tx.objectStore(storeName);
    function receive(request, onSuccess = (value) => value) {
      request.onsuccess = () => {
        try {
          result = onSuccess(request.result);
        } catch (error) {
          failure = error;
          tx.abort();
        }
      };
    }
    try {
      run(store, receive);
    } catch (error) {
      failure = error;
      tx.abort();
    }
  });
}

function broadcast(change) {
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: change }));
  try {
    sender ||= new BroadcastChannel(CHANGE_EVENT);
    sender.postMessage(change);
  } catch {
    // Transactions and the server revision still guard concurrent writes.
  }
}

export function watchWorkoutStorage(onChange) {
  const listener = (event) => onChange(event.detail ?? event.data);
  window.addEventListener(CHANGE_EVENT, listener);
  let channel;
  try {
    channel = new BroadcastChannel(CHANGE_EVENT);
    channel.addEventListener("message", listener);
  } catch {
    // The sync loop also checks the queue when the tab becomes visible.
  }
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    channel?.close();
  };
}

export function readWorkoutAccount() {
  return transaction("account", "readonly", (store, receive) => receive(store.get("active")));
}

export function saveWorkoutAccount(account) {
  return transaction("account", "readwrite", (store) => store.put(account, "active"));
}

export async function forgetWorkoutAccount(userId, announce = true) {
  await transaction("account", "readwrite", (store, receive) => {
    receive(store.get("active"), (current) => {
      if (current?.userId === userId) store.delete("active");
    });
  });
  if (announce) broadcast({ type: "logout", userId });
}

export function workoutKey(userId, clientId, planId, dayId, week) {
  return JSON.stringify([userId, String(clientId), planId, dayId, week]);
}

export function readWorkouts(userId) {
  return transaction("workouts", "readonly", (store, receive) => {
    receive(store.index("userId").getAll(userId));
  });
}

async function changeWorkout(key, change, type) {
  const next = await transaction("workouts", "readwrite", (store, receive) => {
    receive(store.get(key), (current) => {
      const updated = change(current);
      if (updated && updated !== current) store.put(updated);
      return updated;
    });
  });
  if (next && type) broadcast({ type, userId: next.userId });
  return next;
}

export function openWorkout(candidate, repeatId = null) {
  return changeWorkout(candidate.key, (current) => {
    const completed = current?.receipt?.session?.completed_at;
    const replace = completed && (current.sessionDate !== candidate.sessionDate ||
      repeatId === current.sessionId);
    return current && !replace ? current : candidate;
  }, "open");
}

export function readWorkout(key) {
  return transaction("workouts", "readonly", (store, receive) => receive(store.get(key)));
}

export class WorkoutChangedError extends Error {
  constructor() {
    super("Workout changed in another tab");
    this.name = "WorkoutChangedError";
  }
}

export function writeWorkout(previous, changes) {
  return changeWorkout(previous.key, (current) => {
    if (!current || current.sessionId !== previous.sessionId ||
      current.localVersion !== previous.localVersion || current.summary ||
      current.receipt?.session?.completed_at) {
      throw new WorkoutChangedError();
    }
    return { ...current, ...changes, localVersion: current.localVersion + 1, updatedAt: Date.now() };
  }, changes.revision > previous.revision ? "queue" : null);
}

export function acknowledgeWorkout(sent, receipt) {
  return changeWorkout(sent.key, (current) => {
    if (!current || current.sessionId !== sent.sessionId || current.syncedRevision >= sent.revision) return null;
    return { ...current, syncedRevision: Math.min(current.revision, receipt.revision), receipt };
  }, "ack");
}

export function workoutUuid() {
  if (typeof globalThis.crypto.randomUUID === "function") return globalThis.crypto.randomUUID();
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join("-");
}

export function workoutNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const text = value.trim().replace(",", ".");
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

export function workoutSeries(exercise, set, draft) {
  const load = workoutNumber(draft?.load_kg);
  const reps = workoutNumber(draft?.reps_done);
  if (load === null || !Number.isInteger(reps) || reps < 0 || reps > 2_147_483_647) return null;
  return {
    workout_exercise_id: exercise.id,
    planned_set_id: set.id || null,
    set_number: set.set_number,
    load_kg: load,
    reps_done: reps,
    rpe: workoutNumber(draft.rpe),
    rir: workoutNumber(draft.rir),
    notes: draft.notes || null
  };
}

export function workoutSeriesKey(series) {
  return `${series.workout_exercise_id}:${series.set_number}`;
}

export function workoutLocalDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")].join("-");
}

export function workoutWeekAtDate(startDate, dateKey, weekCount) {
  const start = Date.parse(String(startDate || "").slice(0, 10));
  const day = Date.parse(dateKey);
  if (!Number.isFinite(start) || !Number.isFinite(day)) return 1;
  return Math.min(weekCount, Math.max(1, Math.floor((day - start) / (7 * 86_400_000)) + 1));
}

export function completedWorkoutDays(sessions, plan, days, week, weekCount) {
  const dayIds = new Set(days.map((day) => String(day.id)));
  const materialized = (plan?.workout_weeks || []).filter((item) => item.workout_days?.length);
  const firstWeek = materialized[0];
  return new Set(sessions.filter((session) => {
    if (!(session.completed_at || (session.workout_sync_revision == null && session.status === "completed")) ||
      String(session.plan_id) !== String(plan?.id) || !dayIds.has(String(session.day_id))) return false;
    if (session.workout_week_number != null) return Number(session.workout_week_number) === week;
    const legacyWeek = materialized.find((item) => item.workout_days.some((day) => String(day.id) === String(session.day_id)));
    const date = session.session_date || (session.created_at && workoutLocalDate(session.created_at));
    const datedWeek = workoutWeekAtDate(plan?.start_date, date, weekCount);
    return (legacyWeek && legacyWeek !== firstWeek ? Number(legacyWeek.week_number) : datedWeek) === week;
  }).map((session) => String(session.day_id)));
}

export async function workoutRequest(query, timeoutMs = 8_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await query.abortSignal(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}

export async function syncWorkout(supabase, record) {
  const { data, error, status } = await workoutRequest(supabase.rpc("tmfit_sync_workout", {
    p_session_id: record.sessionId,
    p_client_id: record.clientId,
    p_plan_id: record.plan.id,
    p_day_id: record.day.id,
    p_week_number: record.selectedWeek,
    p_session_date: record.sessionDate,
    p_started_at: new Date(record.startedAt).toISOString(),
    p_revision: record.revision,
    p_series: Object.values(record.series),
    p_summary: record.summary
  }));
  if (error) throw Object.assign(new Error(error.message), { code: error.code, status });
  if (data?.session?.id !== record.sessionId || Number(data.revision) < record.revision ||
    !Number.isInteger(data.revision) || !Array.isArray(data.logs) ||
    (record.summary && !data.session.completed_at)) {
    throw new Error("Workout confirmation did not match its request");
  }
  return data;
}

export async function prepareWorkoutShell() {
  if (!("serviceWorker" in navigator)) return false;
  const active = (await navigator.serviceWorker.getRegistration("/"))?.active;
  if (!active) return false;
  const message = new MessageChannel();
  try {
    return await new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), 15_000);
      message.port1.onmessage = (event) => {
        clearTimeout(timeout);
        resolve(event.data?.ready === true);
      };
      try {
        active.postMessage({ type: "TMFIT_PREPARE_WORKOUT" }, [message.port2]);
      } catch {
        clearTimeout(timeout);
        resolve(false);
      }
    });
  } finally {
    message.port1.close();
  }
}
