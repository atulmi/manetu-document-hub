import { Router } from 'express';
import { roleExtract } from '../middleware/roleExtract.ts';
import { runAgentLoop } from '../lib/claude-agent.ts';
import { buildMPEClient } from '../lib/mpe-client.ts';
import { buildFSClient } from '../lib/mcp-fs-client.ts';
import { auditBus } from '../lib/audit-bus.ts';
import type { AgentStep, AuditEvent } from '../types.ts';

export const agentRouter = Router();

function writeSSE(res: import('express').Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

agentRouter.post('/run', roleExtract, async (req, res) => {
  const role = req.role!;
  const prompt = req.body?.prompt;
  if (typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({ error: 'Missing or empty prompt' });
    return;
  }

  const securityEnabled = req.headers['x-security-enabled'] !== 'false';

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let aborted = false;
  req.on('close', () => { aborted = true; });

  const mpeClient = buildMPEClient();
  const fsClient = buildFSClient();

  try {
    const task = await runAgentLoop({
      prompt,
      role,
      securityEnabled,
      mpeClient,
      fsClient,
      onStep: (step: AgentStep) => {
        if (!aborted) writeSSE(res, 'step', step);
      },
      onAudit: (event: AuditEvent) => {
        auditBus.emit('audit', event);
        if (!aborted) writeSSE(res, 'audit', event);
      },
    });

    if (!aborted) {
      writeSSE(res, 'done', { taskId: task.id });
    }
  } catch (err) {
    if (!aborted) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      writeSSE(res, 'error', { message });
    }
  } finally {
    if (!aborted) res.end();
  }
});
