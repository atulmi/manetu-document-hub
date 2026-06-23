import { Router } from 'express';
import { auditBus } from '../lib/audit-bus.ts';
import type { AuditEvent } from '../types.ts';

export const auditRouter = Router();

auditRouter.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const recentEvents = auditBus.getRecentEvents();
  for (const event of recentEvents) {
    res.write(`event: audit\ndata: ${JSON.stringify(event)}\n\n`);
  }

  const onAudit = (event: AuditEvent) => {
    res.write(`event: audit\ndata: ${JSON.stringify(event)}\n\n`);
  };

  auditBus.on('audit', onAudit);

  const heartbeat = setInterval(() => {
    res.write(`event: heartbeat\ndata: {}\n\n`);
  }, 30_000);

  req.on('close', () => {
    auditBus.off('audit', onAudit);
    clearInterval(heartbeat);
  });
});
