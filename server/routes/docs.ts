import { Router } from 'express';
import { roleExtract } from '../middleware/roleExtract.ts';
import { buildMPEClient, MPEConnectionError } from '../lib/mpe-client.ts';
import { buildFSClient } from '../lib/mcp-fs-client.ts';
import type { DocMeta, DocSensitivity } from '../types.ts';

export const docsRouter = Router();

const SENSITIVITY_MRNS: Record<DocSensitivity, string> = {
  public: 'mrn:mcp:docs:resource:public:*',
  internal: 'mrn:mcp:docs:resource:internal:*',
  confidential: 'mrn:mcp:docs:resource:confidential:*',
};

docsRouter.get('/', roleExtract, async (req, res) => {
  const role = req.role!;
  const fsClient = buildFSClient();
  const mpe = buildMPEClient();

  try {
    const allDocs = await fsClient.listDirectory('.');

    const accessByTier = new Map<DocSensitivity, boolean>();
    await Promise.all(
      (['public', 'internal', 'confidential'] as DocSensitivity[]).map(async (tier) => {
        const decision = await mpe.evaluate({
          principal: role,
          resource: SENSITIVITY_MRNS[tier],
          operation: 'read',
        });
        accessByTier.set(tier, decision.decision === 'allow');
      }),
    );

    const enriched: (DocMeta & { accessible: boolean })[] = allDocs.map((doc) => ({
      ...doc,
      accessible: accessByTier.get(doc.sensitivity) ?? false,
    }));

    res.json(enriched);
  } catch (err) {
    if (err instanceof MPEConnectionError) {
      res.status(503).json({ error: 'Policy engine unavailable' });
      return;
    }
    throw err;
  }
});
