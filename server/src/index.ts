import 'dotenv/config';
import express from 'express';
import { generate } from './generate.js';

const app = express();

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (_req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/generate', async (req, res) => {
  const { figmaUrl, nodeId, componentName } = req.body;

  if (!figmaUrl || !nodeId || !componentName) {
    res.status(400).json({
      status: 'error',
      message: 'Missing required fields: figmaUrl, nodeId, componentName',
    });
    return;
  }

  try {
    console.log(`[server] POST /generate — ${componentName}`);
    const result = await generate(figmaUrl, nodeId, componentName);
    res.json({ status: 'ok', file: result.file });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[server] Error: ${message}`);
    res.status(500).json({ status: 'error', message });
  }
});

const PORT = Number(process.env.PORT) || 3333;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[server] Story server listening on http://127.0.0.1:${PORT}`);
});
