import { Router } from 'express';
import { roleExtract } from '../middleware/roleExtract.ts';
import { runAgentLoop } from '../lib/claude-agent.ts';
import { buildMPEClient, MPEConnectionError } from '../lib/mpe-client.ts';
import { buildFSClient } from '../lib/mcp-fs-client.ts';
import { auditBus } from '../lib/audit-bus.ts';
import type { AgentStep, AuditEvent } from '../types.ts';

export const agentRouter = Router();

function writeSSE(res: import('express').Response, event: string, data: unknown) {
  try {
    if (!res.writableEnded) {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }
  } catch {
    // response already closed
  }
}

agentRouter.post('/run', roleExtract, async (req, res) => {
  const role = req.role!;
  const prompt = req.body?.prompt;
  if (typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({ error: 'Missing or empty prompt' });
    return;
  }

  const securityEnabled = req.headers['x-security-enabled'] !== 'false';

  if (!process.env['ANTHROPIC_API_KEY']) {
    res.status(503).json({ error: 'ANTHROPIC_API_KEY is not set. Add it to your .env file and restart the server.' });
    return;
  }

  if (securityEnabled) {
    const mpe = buildMPEClient();
    try {
      await mpe.evaluate({ principal: role, resource: 'mrn:mcp:healthcheck', operation: 'discover' });
    } catch (err) {
      if (err instanceof MPEConnectionError) {
        res.status(503).json({ error: 'Manetu Policy Engine is not running. Start it with: docker compose -f docker/docker-compose.yml up -d' });
        return;
      }
    }
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  let aborted = false;
  req.on('close', () => { aborted = true; });

  const mpeClient = buildMPEClient();
  const fsClient = buildFSClient();

  console.log(`Agent run starting: role=${role}, security=${securityEnabled}, prompt="${prompt.slice(0, 50)}"`);

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
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Agent run error:', err);
    if (!aborted) {
      writeSSE(res, 'error', { message });
    }
  } finally {
    console.log('Agent run finished, aborted:', aborted);
    if (!aborted && !res.writableEnded) res.end();
  }
});
