import { Router } from 'express';
import {
  queryPromptRuns,
  getPromptRunDetail,
  deletePromptRun,
  clearAllPromptRuns,
} from '../lib/audit-index.ts';

export const promptHistoryRouter = Router();

function esUnavailable(res: import('express').Response, err: unknown) {
  console.error('[prompt-history] Elasticsearch request failed:', err);
  res.status(503).json({ error: 'Elasticsearch is unreachable. Make sure it is running: docker compose -f docker/docker-compose.yml up -d' });
}

promptHistoryRouter.get('/', async (_req, res) => {
  try {
    const runs = await queryPromptRuns();
    res.json({ runs });
  } catch (err) {
    esUnavailable(res, err);
  }
});

promptHistoryRouter.get('/:taskId', async (req, res) => {
  try {
    const detail = await getPromptRunDetail(req.params.taskId);
    if (!detail) {
      res.status(404).json({ error: 'Prompt run not found' });
      return;
    }
    res.json(detail);
  } catch (err) {
    esUnavailable(res, err);
  }
});

promptHistoryRouter.delete('/:taskId', async (req, res) => {
  try {
    await deletePromptRun(req.params.taskId);
    res.json({ deleted: true });
  } catch (err) {
    esUnavailable(res, err);
  }
});

promptHistoryRouter.delete('/', async (_req, res) => {
  try {
    await clearAllPromptRuns();
    res.json({ cleared: true });
  } catch (err) {
    esUnavailable(res, err);
  }
});
