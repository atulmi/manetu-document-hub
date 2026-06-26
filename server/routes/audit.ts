import { Router } from 'express';
import { auditBus } from '../lib/audit-bus.ts';
import type { AuditEvent } from '../types.ts';

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
