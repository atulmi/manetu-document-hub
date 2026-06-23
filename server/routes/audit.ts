import { Router } from 'express';

export const auditRouter = Router();

auditRouter.get('/stream', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});
