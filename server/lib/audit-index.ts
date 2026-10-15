import { errors as esErrors } from '@elastic/elasticsearch';
import { esClient, INDICES } from './es-client.ts';
import type { AgentTask, AgentStep, AuditEvent, UserRole, PromptRunSummary } from '../types.ts';

// Write-path functions below intentionally let errors propagate — they
// are awaited directly by backfillRun (used by the /api/audit/backfill
// route), which must fail loudly on an Elasticsearch outage so the
// frontend knows to keep retrying rather than discarding unsynced data.
// The live agent loop (server/routes/agent.ts) calls these too, but
// fire-and-forget with its own .catch() at each call site, since that
// path must never block or break the live SSE stream.

export async function indexPromptRunStart(task: AgentTask, userId?: string): Promise<void> {
  await esClient.update({
    index: INDICES.promptRuns,
    id: task.id,
    doc: {
      id: task.id,
      userId,
      prompt: task.prompt,
      role: task.role,
      status: task.status,
      startedAt: task.startedAt,
    },
    upsert: {
      id: task.id,
      userId,
      prompt: task.prompt,
      role: task.role,
      status: task.status,
      startedAt: task.startedAt,
      allowCount: 0,
      denyCount: 0,
      bypassedCount: 0,
    },
  });
}

export async function indexPromptRunComplete(task: AgentTask): Promise<void> {
  await esClient.update({
    index: INDICES.promptRuns,
    id: task.id,
    doc: {
      status: task.status,
      finalAnswer: task.finalAnswer,
      completedAt: task.completedAt,
    },
    doc_as_upsert: true,
  });
}

export async function indexAgentStep(agentTaskId: string, step: AgentStep, userId?: string): Promise<void> {
  await esClient.index({
    index: INDICES.agentSteps,
    id: `${agentTaskId}:${step.stepNumber}`,
    document: { agentTaskId, userId, ...step },
  });
}

export async function indexAuditEvent(event: AuditEvent, userId?: string): Promise<void> {
  // This runs from two independent paths for the same event — the live
  // SSE stream (fire-and-forget, per event) and useHistorySync's backfill
  // retry (the full run, resent until it succeeds). Both can fire for the
  // same event whenever Elasticsearch is reachable. The raw document write
  // below is naturally idempotent (overwrite by event.id), but the count
  // increment on promptRuns is not — so `create` (instead of `index`) is
  // used to detect a repeat and skip double-counting it.
  try {
    await esClient.create({
      index: INDICES.auditEvents,
      id: event.id,
      document: { ...event, userId },
    });
  } catch (err) {
    if (err instanceof esErrors.ResponseError && err.statusCode === 409) {
      return; // already indexed and counted — nothing more to do
    }
    throw err;
  }

  const field = event.decision === 'allow' ? 'allowCount'
    : event.decision === 'deny' ? 'denyCount'
    : 'bypassedCount';

  await esClient.update({
    index: INDICES.promptRuns,
    id: event.agentTaskId,
    retry_on_conflict: 3,
    script: {
      lang: 'painless',
      source: `ctx._source.${field} = (ctx._source.containsKey('${field}') ? ctx._source.${field} : 0) + 1`,
    },
    upsert: { allowCount: 0, denyCount: 0, bypassedCount: 0, [field]: 1 },
  });
}

export async function backfillRun(task: AgentTask, auditEvents: AuditEvent[], userId?: string): Promise<void> {
  await indexPromptRunStart(task, userId);
  for (const step of task.steps) {
    await indexAgentStep(task.id, step, userId);
  }
  for (const event of auditEvents) {
    await indexAuditEvent(event, userId);
  }
  await indexPromptRunComplete(task);
}

// Read/delete functions below are awaited directly by route handlers and
// intentionally let errors propagate, so a route can return a proper
// error status when Elasticsearch is unreachable rather than pretending
// to succeed.

export async function queryPromptRuns(userId?: string): Promise<PromptRunSummary[]> {
  const result = await esClient.search({
    index: INDICES.promptRuns,
    size: 500,
    sort: [{ startedAt: { order: 'desc' } }],
    ...(userId && { query: { term: { userId } } }),
  });

  return result.hits.hits.map((hit) => {
    const src = hit._source as Record<string, unknown>;
    return {
      taskId: hit._id as string,
      prompt: src['prompt'] as string,
      role: src['role'] as string,
      timestamp: src['startedAt'] as string,
      status: src['status'] as string,
      allowCount: (src['allowCount'] as number | undefined) ?? 0,
      denyCount: (src['denyCount'] as number | undefined) ?? 0,
      bypassedCount: (src['bypassedCount'] as number | undefined) ?? 0,
    };
  });
}

export async function getPromptRunDetail(
  agentTaskId: string,
  userId?: string,
): Promise<{ task: AgentTask; auditEvents: AuditEvent[] } | null> {
  let run: Record<string, unknown>;
  try {
    const runResult = await esClient.get({ index: INDICES.promptRuns, id: agentTaskId });
    run = runResult._source as Record<string, unknown>;
  } catch (err) {
    // A genuine "no such document" is a 404 from Elasticsearch — that's the
    // only case that should read as "not found". Anything else (connection
    // refused, timeout, etc.) must propagate so the route can report a real
    // outage (503) instead of masking it as a deleted/missing record.
    if (err instanceof esErrors.ResponseError && err.statusCode === 404) {
      return null;
    }
    throw err;
  }

  // Ownership check: a run belonging to a different user reads as "not
  // found" rather than 403, so a guessed/enumerated taskId can't be used
  // to confirm another user's run even exists.
  if (userId && run['userId'] !== userId) {
    return null;
  }

  const stepsResult = await esClient.search({
    index: INDICES.agentSteps,
    size: 1000,
    query: { term: { agentTaskId } },
    sort: [{ stepNumber: { order: 'asc' } }],
  });
  const steps = stepsResult.hits.hits.map((hit) => hit._source as unknown as AgentStep);

  const eventsResult = await esClient.search({
    index: INDICES.auditEvents,
    size: 1000,
    query: { term: { agentTaskId } },
    sort: [{ timestamp: { order: 'asc' } }],
  });
  const auditEvents = eventsResult.hits.hits.map((hit) => hit._source as AuditEvent);

  const task: AgentTask = {
    id: agentTaskId,
    prompt: run['prompt'] as string,
    role: run['role'] as UserRole,
    status: run['status'] as AgentTask['status'],
    steps,
    finalAnswer: run['finalAnswer'] as string | undefined,
    startedAt: run['startedAt'] as string,
    completedAt: run['completedAt'] as string | undefined,
  };

  return { task, auditEvents };
}

export async function deletePromptRun(agentTaskId: string, userId?: string): Promise<void> {
  if (userId) {
    // Same ownership check as getPromptRunDetail — silently no-op rather
    // than delete (or reveal via error) a run that isn't this user's.
    const detail = await getPromptRunDetail(agentTaskId, userId);
    if (!detail) return;
  }
  await Promise.all([
    esClient.delete({ index: INDICES.promptRuns, id: agentTaskId }).catch(() => {}),
    esClient.deleteByQuery({ index: INDICES.agentSteps, query: { term: { agentTaskId } } }),
    esClient.deleteByQuery({ index: INDICES.auditEvents, query: { term: { agentTaskId } } }),
  ]);
}

export async function clearAllPromptRuns(userId?: string): Promise<void> {
  const query = userId ? { term: { userId } } : { match_all: {} };
  await Promise.all(
    Object.values(INDICES).map((index) => esClient.deleteByQuery({ index, query })),
  );
}
