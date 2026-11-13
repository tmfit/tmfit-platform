import assert from "node:assert/strict";
import test from "node:test";
import {
  completeWorkoutOnce,
  completedWorkoutDays,
  confirmedWorkoutSets,
  createWorkoutDraftStore,
  insertWorkoutSessionOnce,
  readWorkoutPages,
  saveWorkoutSetOnce,
  workoutRequest,
  workoutSeriesValues,
  workoutSetUuid,
  workoutWeekAtDate
} from "../lib/workout-sync.mjs";

const scope = { id: "session", client_id: 4, user_id: "user", plan_id: "plan", day_id: "day" };

function databaseWithResults(results) {
  const calls = [];
  const query = new Proxy({}, {
    get(_target, method) {
      if (method === "then") return undefined;
      return (...args) => {
        calls.push([method, ...args]);
        if (method === "abortSignal") return Promise.resolve(results.shift());
        return query;
      };
    }
  });
  return { database: query, calls };
}

test("local drafts recover the previous app's data and keep days and weeks separate", () => {
  let storage;
  let id = 0;
  const legacy = { planId: "plan", dayId: "a", selectedWeek: 2, drafts: { first: { load_kg: "32,5" } } };
  const options = {
    read: () => storage && structuredClone(storage),
    write: (book) => Boolean(storage = structuredClone(book)),
    readLegacy: () => legacy,
    makeId: () => String(++id)
  };
  const initial = createWorkoutDraftStore(options);
  const saved = initial.get("plan", "a", 2);
  initial.open({ planId: "plan", dayId: "a", selectedWeek: 3 });
  initial.open({ planId: "plan", dayId: "b", selectedWeek: 2 });

  const recovered = createWorkoutDraftStore(options);
  assert.equal(recovered.get("plan", "a", 2).drafts.first.load_kg, "32,5");
  recovered.clear(saved);
  assert.equal(recovered.update(saved), null);
  assert.equal(recovered.get("plan", "a", 2), null);
  assert.ok(recovered.get("plan", "a", 3));
  assert.equal(recovered.latest().dayId, "b");
});

test("a failed local write preserves a usable in-memory draft and reports the storage failure", () => {
  const store = createWorkoutDraftStore({
    read: () => null,
    write: () => false,
    readLegacy: () => null
  });
  const draft = store.open({ planId: "plan", dayId: "a", selectedWeek: 1, drafts: {} });
  store.update({ ...draft, drafts: { first: { reps_done: "8", _pendingSave: true } } });
  assert.equal(store.isWritable(), false);
  assert.equal(store.latest().drafts.first.reps_done, "8");
});

test("decimal comma and bodyweight are valid, malformed loads and fractional reps are rejected", () => {
  assert.deepEqual(workoutSeriesValues({ load_kg: "32,5", reps_done: "10", rir: "0" }), {
    load_kg: 32.5, reps_done: 10, rpe: null, rir: 0
  });
  assert.equal(workoutSeriesValues({ load_kg: "0", reps_done: "8" }).load_kg, 0);
  assert.equal(workoutSeriesValues({ load_kg: " ", reps_done: "8" }), null);
  assert.equal(workoutSeriesValues({ load_kg: "10", reps_done: "7.5" }), null);
  assert.equal(workoutSeriesValues({ load_kg: Infinity, reps_done: "8" }), null);
});

test("a retried session insert resolves the primary key conflict to the same scoped row", async () => {
  const { database, calls } = databaseWithResults([
    { error: { code: "23505" } },
    { data: scope }
  ]);
  assert.deepEqual(await insertWorkoutSessionOnce(database, scope), { data: scope });
  assert.deepEqual(calls.filter(([method]) => method === "eq").map(([, key, value]) => [key, value]), Object.entries(scope));
});

test("a series has the same database key across retries and a different one in another set", async () => {
  const id = await workoutSetUuid("session", "exercise", 1);
  assert.equal(await workoutSetUuid("session", "exercise", "1"), id);
  assert.notEqual(await workoutSetUuid("session", "exercise", 2), id);
  assert.notEqual(await workoutSetUuid("other-session", "exercise", 1), id);
  const payload = { id, session_id: "session", workout_exercise_id: "exercise", set_number: 1 };
  const { database, calls } = databaseWithResults([{ data: payload }, { data: payload }]);
  await saveWorkoutSetOnce(database, payload);
  await saveWorkoutSetOnce(database, payload);
  assert.deepEqual(calls.filter(([method]) => method === "upsert"), [
    ["upsert", payload, { onConflict: "id" }],
    ["upsert", payload, { onConflict: "id" }]
  ]);
});

test("the summary retry reads the confirmed completion without replacing its date or feedback", async () => {
  const confirmed = { ...scope, completed_at: "2026-11-13T13:00:00Z", client_notes: "Originale" };
  const { database, calls } = databaseWithResults([{ data: [] }, { data: confirmed }]);
  assert.deepEqual(await completeWorkoutOnce(database, scope, {
    completed_at: "2026-11-14T13:00:00Z",
    client_notes: "Secondo tentativo"
  }), { data: confirmed });
  assert.ok(calls.some(([method, key, value]) => method === "is" && key === "completed_at" && value === null));
});

test("two log rows for the same series cannot replace a missing series at completion", () => {
  const a = { id: "a", workout_exercise_id: "ex", set_number: 1, load_kg: 0, reps_done: 10, completed: true };
  const duplicate = { ...a, id: "copy" };
  const b = { ...a, id: "b", set_number: 2 };
  assert.equal(confirmedWorkoutSets([a, duplicate], ["a", "b"], 2), null);
  assert.equal(confirmedWorkoutSets([a, duplicate], [], 2), null);
  assert.equal(confirmedWorkoutSets([a, duplicate, b], ["a", "b"], 2), 2);
});

test("paging completes a truncated history and surfaces failed requests", async () => {
  const { database, calls } = databaseWithResults([{ data: [1, 2] }, { data: [3] }]);
  assert.deepEqual(await readWorkoutPages(() => database, 2), [1, 2, 3]);
  assert.deepEqual(calls.filter(([method]) => method === "range"), [["range", 0, 1], ["range", 2, 3]]);
  const bad = databaseWithResults([{ error: new Error("rete") }]);
  await assert.rejects(() => readWorkoutPages(() => bad.database), /rete/);
});

test("a stalled PostgREST request is cancelled", async () => {
  const query = {
    abortSignal(signal) {
      return new Promise((_, reject) => signal.addEventListener("abort", () => reject(signal.reason), { once: true }));
    }
  };
  await assert.rejects(workoutRequest(query, 10), { name: "AbortError" });
});

test("weekly progress counts each completed day of the current plan only once", () => {
  const row = { completed_at: "yes", plan_id: "plan", day_id: "a", session_date: "2026-11-09" };
  const completed = completedWorkoutDays([
    row, row,
    { ...row, day_id: "b", completed_at: null },
    { ...row, day_id: "b", plan_id: "old-plan" },
    { ...row, day_id: "b", session_date: "2026-11-16" },
    { ...row, day_id: "c", session_date: null, created_at: "2026-11-09T09:00:00Z" }
  ], "plan", [{ id: "a" }, { id: "b" }, { id: "c" }], "2026-11-09", "2026-11-16", (value) => value.slice(0, 10));
  assert.deepEqual([...completed], ["a", "c"]);
  assert.equal(workoutWeekAtDate("2026-11-02", "2026-11-09"), 2);
});
