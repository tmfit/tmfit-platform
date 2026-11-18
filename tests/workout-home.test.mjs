import test from "node:test";
import assert from "node:assert/strict";
import { homeWorkoutForDay } from "../lib/workout-home.mjs";

const wednesday = new Date(2026, 10, 18, 12);
const sessions = [
  { id: 11, title: "Allenamento A · Lunedì", estimated_minutes: 40 },
  { id: 12, title: "Allenamento B · Mer.", estimated_minutes: 55 }
];

test("the Home uses the local weekday in full or abbreviated Italian day names", () => {
  assert.deepEqual(homeWorkoutForDay(sessions, new Set(), wednesday), {
    title: "Allenamento B", minutes: 55
  });
  assert.deepEqual(homeWorkoutForDay(sessions, new Set(), new Date(2026, 10, 16, 12)), {
    title: "Allenamento A", minutes: 40
  });
  assert.deepEqual(homeWorkoutForDay(sessions, new Set(), new Date(2026, 10, 17, 12)), {
    title: "Nessuna seduta in programma oggi"
  });
});

test("an undated program follows the order of its unconfirmed sessions", () => {
  const days = [{ id: 1, title: "Upper" }, { id: 2, title: "Lower" }];
  assert.deepEqual(homeWorkoutForDay(days, new Set(["1"]), wednesday), {
    title: "Allenamento B", minutes: 60
  });
  assert.equal(homeWorkoutForDay(days, new Set(["1", "2"]), wednesday).title, "Settimana completata");
  assert.equal(homeWorkoutForDay([], new Set(), wednesday).title, "Nessun allenamento disponibile");
});

test("a second session scheduled on the same day takes priority once the first is confirmed", () => {
  const days = [...sessions, { id: 13, title: "Seduta 2 · MERCOLEDÌ", estimated_minutes: 30 }];
  assert.deepEqual(homeWorkoutForDay(days, new Set(["12"]), wednesday), {
    title: "Allenamento 2", minutes: 30
  });
});
