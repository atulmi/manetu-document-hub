import { Router } from 'express';
import { checkHealth } from '../lib/es-client.ts';
import { backfillRun } from '../lib/audit-index.ts';
import { authGate } from '../middleware/authGate.ts';
import type { AuditEvent, AgentTask } from '../types.ts';

export const auditRouter = Router();

auditRouter.get('/health', async (_req, res) => {
  res.json({ elasticsearch: await checkHealth() });
});

auditRouter.post('/backfill', authGate, async (req, res) => {
  const task = req.body?.task as AgentTask | undefined;
  const auditEvents = req.body?.auditEvents as AuditEvent[] | undefined;
  if (!task?.id || !Array.isArray(auditEvents)) {
    res.status(400).json({ error: 'Request body must include task and auditEvents' });
    return;
  }
  try {
    await backfillRun(task, auditEvents, req.userId);
    res.json({ synced: true });
  } catch (err) {
    console.error('[audit] backfill failed:', err);
    res.status(503).json({ error: 'Elasticsearch is unreachable, backfill will be retried later' });
  }
});
