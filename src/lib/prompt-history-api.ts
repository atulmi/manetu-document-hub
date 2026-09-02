import { apiFetch } from './api';
import { useStore } from './store';
import type { AgentTask, AuditEvent, PromptRunSummary } from '../types';

export async function fetchPromptHistory(): Promise<PromptRunSummary[]> {
  const { runs } = await apiFetch<{ runs: PromptRunSummary[] }>('/prompt-history');
  return runs;
}

export async function fetchPromptRunDetail(
  taskId: string,
): Promise<{ task: AgentTask; auditEvents: AuditEvent[] }> {
  return apiFetch(`/prompt-history/${taskId}`);
}

export async function deletePromptRun(taskId: string): Promise<void> {
  await apiFetch(`/prompt-history/${taskId}`, { method: 'DELETE' });
  useStore.getState().deleteTaskById(taskId);
}

export async function clearPromptHistory(): Promise<void> {
  await apiFetch('/prompt-history', { method: 'DELETE' });
  useStore.getState().clearAllHistory();
}

// Single source of truth for "is this task still local (live or pending
// sync) or must it be fetched from Elasticsearch" — shared by getRunDetail
// below and usePromptRunDetail, so the rule only has to be right in one
// place. A task is local if it's the currently-running task, or if it's
// finished but still in the unsynced buffer (fetching it from the backend
// would 404 until useHistorySync catches up).
export function resolveLocalTask(
  taskId: string,
  state: { currentTask: AgentTask | null; taskHistory: AgentTask[]; unsyncedTaskIds: string[] },
): AgentTask | null {
  if (state.currentTask?.id === taskId) return state.currentTask;
  if (state.unsyncedTaskIds.includes(taskId)) {
    return state.taskHistory.find((t) => t.id === taskId) ?? null;
  }
  return null;
}

// Resolves a run's full detail from wherever it currently lives: the
// local buffer via resolveLocalTask, otherwise the backend. Used for
// one-off actions like export; usePromptRunDetail covers the reactive
// detail-view case.
export async function getRunDetail(
  taskId: string,
): Promise<{ task: AgentTask; auditEvents: AuditEvent[] } | null> {
  const { currentTask, taskHistory, unsyncedTaskIds, auditEvents } = useStore.getState();
  const localTask = resolveLocalTask(taskId, { currentTask, taskHistory, unsyncedTaskIds });
  if (localTask) {
    return { task: localTask, auditEvents: auditEvents.filter((e) => e.agentTaskId === taskId) };
  }
  try {
    return await fetchPromptRunDetail(taskId);
  } catch {
    return null;
  }
}

// Full task + audit-event data for every prompt run, for the "export all"
// action — combines the summary list with a per-run detail fetch (or
// local buffer read, via getRunDetail) since the list endpoint doesn't
// carry full step traces.
export async function fetchFullPromptHistoryForExport(): Promise<{ tasks: AgentTask[]; auditEvents: AuditEvent[] }> {
  const summaries = await fetchPromptHistory();
  const details = await Promise.all(summaries.map((s) => getRunDetail(s.taskId)));

  const tasks: AgentTask[] = [];
  const auditEvents: AuditEvent[] = [];
  for (const detail of details) {
    if (!detail) continue;
    tasks.push(detail.task);
    auditEvents.push(...detail.auditEvents);
  }
  return { tasks, auditEvents };
}

export async function backfillRun(task: AgentTask, auditEvents: AuditEvent[]): Promise<void> {
  await apiFetch('/audit/backfill', {
    method: 'POST',
    body: JSON.stringify({ task, auditEvents }),
  });
}
