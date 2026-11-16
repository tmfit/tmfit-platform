import { useEffect, useRef, useState } from "react";
import {
  acknowledgeWorkout,
  readWorkouts,
  syncWorkout,
  watchWorkoutStorage
} from "../../lib/workout-offline.mjs";

const RETRY_DELAYS = [3_000, 10_000, 30_000, 60_000];

function syncErrorKind(error) {
  if (error?.status === 401 || ["PGRST301", "PGRST302", "PGRST303"].includes(error?.code)) return "login";
  if (error?.code === "P0002" || error?.code === "23503") return "changed";
  if (error?.code === "PGRST202") return "migration";
  return "network";
}

export default function useWorkoutSync(database, userId, canSync, sessionExpiresAt) {
  const [records, setRecords] = useState([]);
  const [syncErrors, setSyncErrors] = useState({});
  const refresh = useRef(() => {});
  const retry = useRef(() => {});

  useEffect(() => {
    let stopped = false;
    let running = false;
    let again = false;
    let timeout;
    let attempt = 0;
    let generation = 0;
    const paused = new Map();

    async function readQueue() {
      const request = ++generation;
      const rows = await readWorkouts(userId);
      if (!stopped && request === generation) setRecords(rows);
      return rows;
    }

    function report(record, error) {
      if (!stopped) setSyncErrors((current) => ({ ...current, [record.sessionId]: error }));
    }

    async function run() {
      if (stopped) return;
      if (running) {
        again = true;
        return;
      }
      clearTimeout(timeout);
      running = true;
      let retryLater = false;
      try {
        const rows = await readQueue();
        if (!canSync || navigator.onLine === false || stopped) return;
        for (const record of rows) {
          if (stopped || navigator.onLine === false) break;
          if (record.revision <= record.syncedRevision || paused.get(record.sessionId) === record.revision) continue;
          try {
            const receipt = await syncWorkout(database, record);
            await acknowledgeWorkout(record, receipt);
            report(record, null);
          } catch (error) {
            const kind = syncErrorKind(error);
            report(record, kind);
            if (kind === "network") retryLater = true;
            else paused.set(record.sessionId, record.revision);
          }
        }
      } catch {
        // The editor reports IndexedDB failures at the point of saving.
        retryLater = canSync;
      } finally {
        running = false;
        if (!stopped && again) {
          again = false;
          void run();
        } else if (!stopped && retryLater) {
          timeout = setTimeout(run, RETRY_DELAYS[Math.min(attempt++, RETRY_DELAYS.length - 1)]);
        } else {
          attempt = 0;
        }
      }
    }

    refresh.current = () => { void readQueue().catch(() => {}); };
    const resume = () => {
      paused.clear();
      attempt = 0;
      void run();
    };
    retry.current = resume;
    const onVisible = () => { if (document.visibilityState === "visible") resume(); };
    const unsubscribe = watchWorkoutStorage((change) => {
      if (change?.userId !== userId) return;
      if (change.type === "queue" || change.type === "open") void run();
      else if (change.type === "ack") refresh.current();
    });
    window.addEventListener("online", resume);
    window.addEventListener("pageshow", resume);
    document.addEventListener("visibilitychange", onVisible);
    setSyncErrors({});
    void run();
    return () => {
      stopped = true;
      clearTimeout(timeout);
      unsubscribe();
      window.removeEventListener("online", resume);
      window.removeEventListener("pageshow", resume);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [database, userId, canSync, sessionExpiresAt]);

  return { records, syncErrors, refresh, retry };
}
