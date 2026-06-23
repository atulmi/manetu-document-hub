import { Router } from 'express';
import { roleExtract } from '../middleware/roleExtract.ts';
import { buildMPEClient, MPEConnectionError } from '../lib/mpe-client.ts';
import { TOOL_REGISTRY } from '../lib/tool-registry.ts';
import type { MCPToolDef } from '../types.ts';

export const toolsRouter = Router();

interface CacheEntry {
  data: (MCPToolDef & { accessible: boolean; deniedReason?: string })[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000;

toolsRouter.get('/', roleExtract, async (req, res) => {
  const role = req.role!;
  const cached = cache.get(role);
  if (cached && cached.expiresAt > Date.now()) {
    res.json(cached.data);
    return;
  }

  const mpe = buildMPEClient();
  try {
    const results = await Promise.all(
      TOOL_REGISTRY.map(async (tool) => {
        const decision = await mpe.evaluate({
          principal: role,
          resource: tool.mrn,
          operation: 'discover',
        });
        return {
          ...tool,
          accessible: decision.decision === 'allow',
          deniedReason: decision.decision === 'deny' ? decision.rule : undefined,
        };
      }),
    );

    cache.set(role, { data: results, expiresAt: Date.now() + CACHE_TTL_MS });
    res.json(results);
  } catch (err) {
    if (err instanceof MPEConnectionError) {
      res.status(503).json({ error: 'Policy engine unavailable' });
      return;
    }
    throw err;
  }
});
