import 'dotenv/config';

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

import express from 'express';
import cors from 'cors';
import { agentRouter } from './routes/agent.ts';
import { toolsRouter } from './routes/tools.ts';
import { docsRouter } from './routes/docs.ts';
import { auditRouter } from './routes/audit.ts';
import { promptHistoryRouter } from './routes/prompt-history.ts';
import { ensureIndices } from './lib/es-client.ts';

const app = express();
app.use(cors({ origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/agent', agentRouter);
app.use('/api/tools', toolsRouter);
app.use('/api/docs', docsRouter);
app.use('/api/audit', auditRouter);
app.use('/api/prompt-history', promptHistoryRouter);

ensureIndices().catch((err) => {
  console.warn('Elasticsearch is not reachable at startup — prompt history will not persist until it is available:', err instanceof Error ? err.message : err);
});

const port = process.env['PORT'] ?? 3001;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
