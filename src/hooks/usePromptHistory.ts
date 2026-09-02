import { useEffect, useState, useMemo } from 'react';
import { useStore } from '../lib/store';
import { fetchPromptHistory } from '../lib/prompt-history-api';
import type { AgentTask, AuditEvent, PromptRunSummary } from '../types';

function summarizeLocalTask(task: AgentTask, auditEvents: AuditEvent[]): PromptRunSummary {
  const events = auditEvents.filter((e) => e.agentTaskId === task.id);
  return {
    taskId: task.id,
    prompt: task.prompt,
    role: task.role,
    timestamp: task.startedAt,
    status: task.status,
    allowCount: events.filter((e) => e.decision === 'allow').length,
    denyCount: events.filter((e) => e.decision === 'deny').length,
    bypassedCount: events.filter((e) => e.decision === 'bypassed').length,
  };
}

// Prompt run list, backed by Elasticsearch via GET /api/prompt-history.
// Runs still sitting in the local unsynced buffer (e.g. mid-outage, see
// useHistorySync) and the currently-running task are merged in from the
// store so nothing appears to vanish while waiting on a sync.
export function usePromptHistory() {
  const [runs, setRuns] = useState<PromptRunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const historyVersion = useStore((s) => s.historyVersion);
  const currentTask = useStore((s) => s.currentTask);
  const taskHistory = useStore((s) => s.taskHistory);
  const unsyncedTaskIds = useStore((s) => s.unsyncedTaskIds);
  const auditEvents = useStore((s) => s.auditEvents);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPromptHistory()
      .then((r) => {
        if (cancelled) return;
        setRuns(r);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load prompt history');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [historyVersion]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const groups = useMemo(() => {
    const byId = new Map(runs.map((r) => [r.taskId, r]));

    for (const id of unsyncedTaskIds) {
      const task = taskHistory.find((t) => t.id === id);
      if (task) byId.set(id, summarizeLocalTask(task, auditEvents));
    }

    if (currentTask) {
      byId.set(currentTask.id, summarizeLocalTask(currentTask, auditEvents));
    }

    return [...byId.values()].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [runs, unsyncedTaskIds, taskHistory, currentTask, auditEvents]);

  return { groups, loading, error };
}
