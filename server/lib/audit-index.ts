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

export async function indexPromptRunStart(task: AgentTask): Promise<void> {
  await esClient.update({
    index: INDICES.promptRuns,
    id: task.id,
    doc: {
      id: task.id,
      prompt: task.prompt,
      role: task.role,
      status: task.status,
      startedAt: task.startedAt,
    },
    upsert: {
      id: task.id,
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

export async function indexAgentStep(agentTaskId: string, step: AgentStep): Promise<void> {
  await esClient.index({
    index: INDICES.agentSteps,
    id: `${agentTaskId}:${step.stepNumber}`,
    document: { agentTaskId, ...step },
  });
}

export async function indexAuditEvent(event: AuditEvent): Promise<void> {
  await esClient.index({
    index: INDICES.auditEvents,
    id: event.id,
    document: event,
  });

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

export async function backfillRun(task: AgentTask, auditEvents: AuditEvent[]): Promise<void> {
  await indexPromptRunStart(task);
  for (const step of task.steps) {
    await indexAgentStep(task.id, step);
  }
  for (const event of auditEvents) {
    await indexAuditEvent(event);
  }
  await indexPromptRunComplete(task);
}

// Read/delete functions below are awaited directly by route handlers and
// intentionally let errors propagate, so a route can return a proper
// error status when Elasticsearch is unreachable rather than pretending
// to succeed.

export async function queryPromptRuns(): Promise<PromptRunSummary[]> {
  const result = await esClient.search({
    index: INDICES.promptRuns,
    size: 500,
    sort: [{ startedAt: { order: 'desc' } }],
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

export async function deletePromptRun(agentTaskId: string): Promise<void> {
  await Promise.all([
    esClient.delete({ index: INDICES.promptRuns, id: agentTaskId }).catch(() => {}),
    esClient.deleteByQuery({ index: INDICES.agentSteps, query: { term: { agentTaskId } } }),
    esClient.deleteByQuery({ index: INDICES.auditEvents, query: { term: { agentTaskId } } }),
  ]);
}

export async function clearAllPromptRuns(): Promise<void> {
  await Promise.all(
    Object.values(INDICES).map((index) =>
      esClient.deleteByQuery({ index, query: { match_all: {} } }),
    ),
  );
}
