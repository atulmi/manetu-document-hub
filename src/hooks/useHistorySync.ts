import { useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import { backfillRun } from '../lib/prompt-history-api';

const SYNC_INTERVAL_MS = 15_000;

// Retries indexing any finished runs still sitting in the local
// durability buffer (store.unsyncedTaskIds) until Elasticsearch confirms
// each one. Handles an outage of any length with the same loop — a
// 10-second blip and a 10-hour outage both just mean more retries.
export function useHistorySync() {
  const unsyncedCount = useStore((s) => s.unsyncedTaskIds.length);
  const syncingRef = useRef(false);

  useEffect(() => {
    if (unsyncedCount === 0) return;

    const trySync = async () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      try {
        // No health check up front — per ISSUE-030, gating on one first
        // reintroduces a race where Elasticsearch recovers in the gap
        // between polls. The backfill attempt itself is the health check.
        for (const taskId of useStore.getState().unsyncedTaskIds) {
          const { taskHistory, auditEvents, markSynced } = useStore.getState();
          const task = taskHistory.find((t) => t.id === taskId);
          if (!task) {
            markSynced(taskId);
            continue;
          }
          const events = auditEvents.filter((e) => e.agentTaskId === taskId);
          try {
            await backfillRun(task, events);
            markSynced(taskId);
          } catch {
            break; // Elasticsearch likely still unreachable — retry next interval
          }
        }
      } finally {
        syncingRef.current = false;
      }
    };

    trySync();
    const interval = setInterval(trySync, SYNC_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [unsyncedCount]);
}
