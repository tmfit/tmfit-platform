import assert from "node:assert/strict";
import test from "node:test";
import {
  completedWorkoutDays, syncWorkout, workoutSeries, workoutUploadLabel, workoutWeekAtDate
} from "../lib/workout-offline.mjs";

const plan = {
  id: "plan",
  start_date: "2026-11-12",
  workout_weeks: [{ week_number: 1, workout_days: ["a", "b", "c", "d"].map((id) => ({ id })) }]
};
const days = plan.workout_weeks[0].workout_days;
const session = { plan_id: "plan", day_id: "a", session_date: "2026-11-17", status: "completed" };

test("the workout counter counts distinct days in the selected plan week", () => {
  const incomplete = { ...session, day_id: "b", status: "in_progress", workout_sync_revision: 1 };
  const selectedWeekTwo = { ...session, day_id: "c", workout_week_number: 2, completed_at: "2026-11-17" };
  const rows = [session, session, incomplete, selectedWeekTwo, { ...session, plan_id: "other", day_id: "d" }, { ...session, day_id: "unknown" }];
  assert.deepEqual([...completedWorkoutDays(rows, plan, days, 1, 4)], ["a"]);
  assert.deepEqual([...completedWorkoutDays(rows, plan, days, 2, 4)], ["c"]);
  assert.equal(workoutWeekAtDate(plan.start_date, "2026-11-19", 4), 2);
});

test("legacy sessions in a separately materialized week retain that week's day", () => {
  const later = { ...plan, workout_weeks: [...plan.workout_weeks, { week_number: 2, workout_days: [{ id: "x" }] }] };
  assert.deepEqual([...completedWorkoutDays([{ ...session, day_id: "x" }], later, [{ id: "x" }], 2, 4)], ["x"]);
});

test("series parsing accepts zero and Italian decimal input without truncating repetitions", () => {
  const exercise = { id: "exercise" };
  const set = { set_number: 1 };
  assert.equal(workoutSeries(exercise, set, { load_kg: 0, reps_done: "0" }).load_kg, 0);
  assert.equal(workoutSeries(exercise, set, { load_kg: "25,5", reps_done: "8" }).load_kg, 25.5);
  assert.equal(workoutSeries(exercise, set, { load_kg: "25", reps_done: "8,5" }), null);
  assert.equal(workoutSeries(exercise, set, { load_kg: "25 kg", reps_done: "8" }), null);
});

test("the upload label tracks the current revision and only confirms an acknowledged save", () => {
  const record = { sessionId: "first", revision: 3, syncedRevision: 2 };
  const current = { sessionId: "first", revision: 3 };
  assert.equal(workoutUploadLabel(record, current, true), "Caricamento al database in background…");
  assert.equal(workoutUploadLabel(record, current, false), "In attesa di sincronizzazione");
  assert.equal(workoutUploadLabel(record, { ...current, revision: 2 }, true), "In attesa di sincronizzazione");
  assert.equal(workoutUploadLabel({ ...record, syncedRevision: 3 }, current, true), "Sincronizzato");
});

test("replaying a completed snapshot uses the same id and revision and requires a server confirmation", async () => {
  const record = {
    sessionId: "stable-id", clientId: 1, plan: { id: "plan" }, day: { id: "day" },
    selectedWeek: 1, sessionDate: "2026-11-16", startedAt: 1760000000000, revision: 3,
    series: {}, summary: { planned_sets: 3 }
  };
  const calls = [];
  let receipt = { session: { id: "stable-id", completed_at: "2026-11-16" }, revision: 3, logs: [] };
  const database = { rpc(name, params) {
    calls.push({ name, params });
    return { abortSignal: async () => ({ data: receipt }) };
  } };
  await syncWorkout(database, record);
  await syncWorkout(database, record);
  assert.deepEqual(calls[0], calls[1]);
  receipt = { ...receipt, session: { id: "stable-id" } };
  await assert.rejects(syncWorkout(database, record), /did not match/);
});
