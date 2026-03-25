import 'dotenv/config';
import express from 'express';
import net from 'node:net';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { generate } from './generate.js';

const STORYBOOK_ROOT = process.env.STORYBOOK_ROOT || '../storybook';
const STORYBOOK_PORT = 6006;
const STORYBOOK_URL = `http://localhost:${STORYBOOK_PORT}`;

function isPortListening(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: '127.0.0.1' });
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error', () => { resolve(false); });
  });
}

function waitForPort(port: number, retries = 15, intervalMs = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = async () => {
      if (await isPortListening(port)) return resolve(true);
      if (++attempts >= retries) return resolve(false);
      setTimeout(check, intervalMs);
    };
    check();
  });
}

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

app.post('/open-storybook', async (_req, res) => {
  try {
    const alreadyRunning = await isPortListening(STORYBOOK_PORT);
    if (alreadyRunning) {
      console.log('[server] Storybook already running');
      res.json({ status: 'ok', url: STORYBOOK_URL });
      return;
    }

    console.log('[server] Starting Storybook...');
    const cwd = path.resolve(STORYBOOK_ROOT);
    const child = spawn('npm', ['run', 'storybook'], {
      cwd,
      detached: true,
      stdio: 'ignore',
    });
    child.unref();

    const ready = await waitForPort(STORYBOOK_PORT);
    if (ready) {
      console.log('[server] Storybook is ready');
      res.json({ status: 'ok', url: STORYBOOK_URL });
    } else {
      res.status(504).json({
        status: 'error',
        message: 'Storybook did not start within 15 seconds',
      });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`[server] open-storybook error: ${message}`);
    res.status(500).json({ status: 'error', message });
  }
});

const PORT = Number(process.env.PORT) || 3333;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`[server] Story server listening on http://127.0.0.1:${PORT}`);
});
