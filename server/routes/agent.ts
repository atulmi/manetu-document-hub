import { Router } from 'express';

export const agentRouter = Router();

agentRouter.post('/run', (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});
