import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { agentRouter } from './routes/agent.ts';
import { toolsRouter } from './routes/tools.ts';
import { docsRouter } from './routes/docs.ts';
import { auditRouter } from './routes/audit.ts';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/agent', agentRouter);
app.use('/api/tools', toolsRouter);
app.use('/api/docs', docsRouter);
app.use('/api/audit', auditRouter);

const port = process.env['PORT'] ?? 3001;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
