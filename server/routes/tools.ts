import { Router } from 'express';
import { roleExtract } from '../middleware/roleExtract.ts';

export const toolsRouter = Router();

toolsRouter.get('/', roleExtract, (_req, res) => {
  res.status(501).json({ error: 'Not implemented' });
});
