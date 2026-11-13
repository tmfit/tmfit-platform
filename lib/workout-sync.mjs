const REQUEST_TIMEOUT_MS = 12_000;

function uuidFromBytes(bytes, version) {
  bytes[6] = (bytes[6] & 15) | (version << 4);
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes.slice(0, 16), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join("-");
}

export function workoutUuid(crypto = globalThis.crypto) {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return uuidFromBytes(crypto.getRandomValues(new Uint8Array(16)), 4);
}

export async function workoutSetUuid(sessionId, exerciseId, setNumber) {
  const key = new TextEncoder().encode(JSON.stringify([sessionId, exerciseId, Number(setNumber)]));
  const hash = await globalThis.crypto.subtle.digest("SHA-256", key);
  return uuidFromBytes(new Uint8Array(hash), 8);
}

function workoutDraftIdentity(planId, dayId, selectedWeek) {
  return JSON.stringify([String(planId), String(dayId), Number(selectedWeek) || 1]);
}

export function createWorkoutDraftStore({ read, write, readLegacy, makeId = workoutUuid }) {
  let book;
  let writable = true;

  function load() {
    const stored = writable ? read() : null;
    if (stored?.drafts && typeof stored.drafts === "object" && !Array.isArray(stored.drafts)) {
      book = stored;
    }
    if (book) return book;

    book = { latestKey: "", drafts: {} };
    const legacy = readLegacy();
    if (legacy?.planId && legacy?.dayId) {
      const key = workoutDraftIdentity(legacy.planId, legacy.dayId, legacy.selectedWeek);
      book = { latestKey: key, drafts: { [key]: { ...legacy, draftId: makeId() } } };
      persist(book);
    }
    return book;
  }

  function persist(next) {
    book = next;
    writable = write(next);
  }

  function save(snapshot, updateOnly) {
    const current = load();
    const key = workoutDraftIdentity(snapshot.planId, snapshot.dayId, snapshot.selectedWeek);
    const previous = current.drafts[key];
    if (updateOnly && (!previous || previous.draftId !== snapshot.draftId)) return null;
    const next = {
      ...previous,
      ...snapshot,
      draftId: previous?.draftId || makeId(),
      updatedAt: new Date().toISOString()
    };
    persist({ latestKey: key, drafts: { ...current.drafts, [key]: next } });
    return next;
  }

  return {
    get(planId, dayId, selectedWeek) {
      return load().drafts[workoutDraftIdentity(planId, dayId, selectedWeek)] || null;
    },
    latest() {
      const current = load();
      return current.drafts[current.latestKey] || null;
    },
    open(snapshot) {
      return save(snapshot, false);
    },
    update(snapshot) {
      return save(snapshot, true);
    },
    clear(snapshot) {
      const current = load();
      const key = workoutDraftIdentity(snapshot.planId, snapshot.dayId, snapshot.selectedWeek);
      if (current.drafts[key]?.draftId !== snapshot.draftId) return;
      const drafts = { ...current.drafts };
      delete drafts[key];
      const latestKey = current.latestKey === key ? "" : current.latestKey;
      persist({ latestKey, drafts });
    },
    isWritable() {
      return writable;
    }
  };
}

export function workoutNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const text = value.trim().replace(",", ".");
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

export function workoutSeriesValues(draft = {}) {
  const load = workoutNumber(draft.load_kg);
  const reps = workoutNumber(draft.reps_done);
  if (load === null || !Number.isInteger(reps) || reps < 0 || reps > 2_147_483_647) return null;
  return { load_kg: load, reps_done: reps, rpe: workoutNumber(draft.rpe), rir: workoutNumber(draft.rir) };
}

export function workoutWriteError(error) {
  if (error?.status === 0 || /failed to fetch|load failed|network|abort|timeout/i.test(error?.message || "")) {
    return "Connessione interrotta. Il salvataggio è da confermare. Riprova quando torna la rete.";
  }
  return "Il salvataggio è da confermare. Riprova tra poco.";
}

export async function workoutRequest(query, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await query.abortSignal(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
}

export async function readWorkoutPages(makeQuery, pageSize = 250) {
  const rows = [];
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await workoutRequest(makeQuery().range(offset, offset + pageSize - 1));
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < pageSize) return rows;
  }
}

function scopedWorkoutSession(query, scope) {
  return query.eq("id", scope.id)
    .eq("client_id", scope.client_id)
    .eq("user_id", scope.user_id)
    .eq("plan_id", scope.plan_id)
    .eq("day_id", scope.day_id);
}

export function readWorkoutSession(database, scope) {
  return workoutRequest(scopedWorkoutSession(
    database.from("workout_sessions").select("*"), scope
  ).maybeSingle());
}

export async function insertWorkoutSessionOnce(database, payload) {
  const result = await workoutRequest(database.from("workout_sessions").insert(payload).select("*").single());
  if (result.error?.code !== "23505") return result;
  return readWorkoutSession(database, payload);
}

export function saveWorkoutSetOnce(database, payload, savedId) {
  const table = database.from("workout_set_logs");
  const query = savedId
    ? table.update(payload)
      .eq("id", savedId)
      .eq("session_id", payload.session_id)
      .eq("workout_exercise_id", payload.workout_exercise_id)
      .eq("set_number", payload.set_number)
    : table.upsert(payload, { onConflict: "id" });
  return workoutRequest(query.select("*").single());
}

export async function completeWorkoutOnce(database, scope, summary) {
  const result = await workoutRequest(scopedWorkoutSession(
    database.from("workout_sessions").update(summary), scope
  ).is("completed_at", null).select("*"));

  if (result.error) return result;
  if (result.data?.length) return { ...result, data: result.data[0] };
  return readWorkoutSession(database, scope);
}

export function confirmedWorkoutSets(rows, expectedIds, expectedCount) {
  const confirmed = rows.filter((row) =>
    row.completed && workoutSeriesValues(row) && row.workout_exercise_id && row.set_number != null
  );
  const ids = new Set(confirmed.map((row) => String(row.id)));
  const count = new Set(confirmed.map((row) => `${row.workout_exercise_id}:${row.set_number}`)).size;
  if (count === 0 || count < expectedCount || expectedIds.some((id) => !ids.has(String(id)))) return null;
  return count;
}

export function completedWorkoutDays(sessions, planId, days, weekStart, weekEnd, localDateKey) {
  const dayIds = new Set(days.map((day) => String(day.id)));
  return new Set(sessions.filter((session) => {
    if (!session.completed_at || String(session.plan_id) !== String(planId) || !dayIds.has(String(session.day_id))) {
      return false;
    }
    const date = session.session_date || (session.created_at && localDateKey(session.created_at));
    return date && date >= weekStart && date < weekEnd;
  }).map((session) => String(session.day_id)));
}

export function workoutWeekAtDate(startDate, dateKey) {
  const start = Date.parse(String(startDate || "").slice(0, 10));
  const day = Date.parse(dateKey);
  if (!Number.isFinite(start) || !Number.isFinite(day)) return 1;
  return Math.max(1, Math.floor((day - start) / (7 * 86_400_000)) + 1);
}
