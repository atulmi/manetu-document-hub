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

docsRouter.get('/content/:docPath', roleExtract, async (req, res) => {
  const role = req.role!;
  const docPath = req.params['docPath'] as string | undefined;
  if (!docPath || typeof docPath !== 'string') {
    res.status(400).json({ error: 'Missing document path' });
    return;
  }

  const decoded = Buffer.from(docPath, 'base64url').toString('utf-8');
  const tier = decoded.split('/')[0] as DocSensitivity;
  const mrn = SENSITIVITY_MRNS[tier];

  if (!mrn) {
    res.status(400).json({ error: 'Invalid document path' });
    return;
  }

  const mpe = buildMPEClient();
  try {
    const decision = await mpe.evaluate({ principal: role, resource: mrn, operation: 'read' });
    if (decision.decision === 'deny') {
      res.status(403).json({ error: `Access denied for ${role} role: ${decision.rule ?? 'default-deny'}` });
      return;
    }

    const fsClient = buildFSClient();
    const content = await fsClient.readFile(decoded);
    res.json({ content });
  } catch (err) {
    if (err instanceof MPEConnectionError) {
      res.status(503).json({ error: 'Policy engine unavailable' });
      return;
    }
    throw err;
  }
});
