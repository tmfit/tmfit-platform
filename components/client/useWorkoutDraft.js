import { useRef, useState } from "react";
import { workoutSeriesKey, writeWorkout } from "../../lib/workout-offline.mjs";

export default function useWorkoutDraft(record) {
  const committed = useRef(record);
  const desired = useRef({
    progress: record.progress,
    series: record.series,
    revision: record.revision,
    summary: record.summary
  });
  const tail = useRef(Promise.resolve());
  const generation = useRef(0);
  const [saved, setSaved] = useState(record);
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState(null);

  function commit(changes) {
    const request = ++generation.current;
    setWriting(true);
    const task = tail.current.then(async () => {
      try {
        const next = await writeWorkout(committed.current, changes);
        committed.current = next;
        setSaved(next);
        if (request === generation.current) setError(null);
        return next;
      } catch (failure) {
        if (request === generation.current) setError(failure);
        return null;
      } finally {
        if (request === generation.current) setWriting(false);
      }
    });
    tail.current = task;
    return task;
  }

  function save(progress, { series, summary } = {}) {
    const current = desired.current;
    if (current.summary) return tail.current;
    desired.current = {
      progress,
      series: series ? { ...current.series, [workoutSeriesKey(series)]: series } : current.series,
      revision: current.revision + (series || summary ? 1 : 0),
      summary: summary || null
    };
    return commit(desired.current);
  }

  function retry() { return commit(desired.current); }

  return { saved, desired, save, retry, writing, error };
}
