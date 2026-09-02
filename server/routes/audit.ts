import { Router } from 'express';
import { auditBus } from '../lib/audit-bus.ts';
import { checkHealth } from '../lib/es-client.ts';
import { backfillRun } from '../lib/audit-index.ts';
import type { AuditEvent, AgentTask } from '../types.ts';

export const auditRouter = Router();

function safeWrite(res: import('express').Response, data: string): boolean {
  try {
    if (!res.writableEnded && !res.destroyed) {
      res.write(data);
      return true;
    }
  } catch {
    // connection lost
  }
  return false;
}

auditRouter.delete('/clear', (_req, res) => {
  auditBus.clear();
  res.json({ cleared: true });
});

auditRouter.get('/health', async (_req, res) => {
  res.json({ elasticsearch: await checkHealth() });
});

auditRouter.post('/backfill', async (req, res) => {
  const task = req.body?.task as AgentTask | undefined;
  const auditEvents = req.body?.auditEvents as AuditEvent[] | undefined;
  if (!task?.id || !Array.isArray(auditEvents)) {
    res.status(400).json({ error: 'Request body must include task and auditEvents' });
    return;
  }
  try {
    await backfillRun(task, auditEvents);
    res.json({ synced: true });
  } catch (err) {
    console.error('[audit] backfill failed:', err);
    res.status(503).json({ error: 'Elasticsearch is unreachable, backfill will be retried later' });
  }
});

auditRouter.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const recentEvents = auditBus.getRecentEvents();
  for (const event of recentEvents) {
    safeWrite(res, `event: audit\ndata: ${JSON.stringify(event)}\n\n`);
  }

  const onAudit = (event: AuditEvent) => {
    safeWrite(res, `event: audit\ndata: ${JSON.stringify(event)}\n\n`);
  };

  auditBus.on('audit', onAudit);

  const heartbeat = setInterval(() => {
    safeWrite(res, `event: heartbeat\ndata: {}\n\n`);
  }, 30_000);

  req.on('close', () => {
    auditBus.off('audit', onAudit);
    clearInterval(heartbeat);
  });
});
