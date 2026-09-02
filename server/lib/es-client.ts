import { Client } from '@elastic/elasticsearch';

export const INDICES = {
  promptRuns: 'prompt-runs',
  agentSteps: 'agent-steps',
  auditEvents: 'audit-events',
} as const;

export const esClient = new Client({
  node: process.env['ELASTICSEARCH_URL'] ?? 'http://localhost:9200',
});

async function createIndexIfMissing(index: string, mappings: Record<string, unknown>): Promise<void> {
  const exists = await esClient.indices.exists({ index });
  if (!exists) {
    await esClient.indices.create({ index, mappings });
  }
}

export async function ensureIndices(): Promise<void> {
  await createIndexIfMissing(INDICES.promptRuns, {
    properties: {
      id: { type: 'keyword' },
      prompt: { type: 'text' },
      role: { type: 'keyword' },
      status: { type: 'keyword' },
      finalAnswer: { type: 'text' },
      startedAt: { type: 'date' },
      completedAt: { type: 'date' },
      allowCount: { type: 'integer' },
      denyCount: { type: 'integer' },
      bypassedCount: { type: 'integer' },
    },
  });

  await createIndexIfMissing(INDICES.agentSteps, {
    properties: {
      agentTaskId: { type: 'keyword' },
      stepNumber: { type: 'integer' },
      type: { type: 'keyword' },
      content: { type: 'text' },
      toolCall: { type: 'object', enabled: true },
      timestamp: { type: 'date' },
    },
  });

  await createIndexIfMissing(INDICES.auditEvents, {
    properties: {
      id: { type: 'keyword' },
      agentTaskId: { type: 'keyword' },
      timestamp: { type: 'date' },
      principal: { type: 'keyword' },
      resource: { type: 'keyword' },
      operation: { type: 'keyword' },
      decision: { type: 'keyword' },
      policyRule: { type: 'keyword' },
    },
  });
}

export async function checkHealth(): Promise<boolean> {
  try {
    const health = await esClient.cluster.health({}, { requestTimeout: 2000 });
    return health.status === 'green' || health.status === 'yellow';
  } catch {
    return false;
  }
}
