import { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { fetchPromptRunDetail, resolveLocalTask } from '../lib/prompt-history-api';
import type { AgentTask, AuditEvent } from '../types';

// Full step trace + audit events for one run. The currently-running task,
// and any finished-but-not-yet-synced task (still in the local buffer —
// fetching it from the backend would 404 until useHistorySync catches
// up), are served from the store directly. Anything else is fetched from
// Elasticsearch via GET /api/prompt-history/:taskId.
export function usePromptRunDetail(taskId: string | null) {
  const currentTask = useStore((s) => s.currentTask);
  const taskHistory = useStore((s) => s.taskHistory);
  const auditEvents = useStore((s) => s.auditEvents);
  const unsyncedTaskIds = useStore((s) => s.unsyncedTaskIds);
  const [detail, setDetail] = useState<{ task: AgentTask; auditEvents: AuditEvent[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const localTask = taskId ? resolveLocalTask(taskId, { currentTask, taskHistory, unsyncedTaskIds }) : null;
  const hasLocalTask = !!localTask;

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!taskId || hasLocalTask) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchPromptRunDetail(taskId)
      .then((d) => { if (!cancelled) setDetail(d); })
      .catch(() => { if (!cancelled) setDetail(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [taskId, hasLocalTask]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (localTask) {
    return {
      task: localTask,
      auditEvents: auditEvents.filter((e) => e.agentTaskId === taskId),
      loading: false,
    };
  }

  return { task: detail?.task ?? null, auditEvents: detail?.auditEvents ?? [], loading };
}
