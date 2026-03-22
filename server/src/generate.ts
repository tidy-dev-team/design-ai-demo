import { spawn } from 'node:child_process';
import path from 'node:path';
import { buildPrompt } from './prompt.js';

const STORYBOOK_ROOT = process.env.STORYBOOK_ROOT || '../storybook';
const CLAUDE_TIMEOUT_MS = Number(process.env.CLAUDE_TIMEOUT_MS) || 60_000;
const COMPONENTS_ROOT = process.env.COMPONENTS_ROOT || 'src/components';

export interface GenerateResult {
  file: string;
  output: string;
}

export function generate(
  figmaUrl: string,
  nodeId: string,
  componentName: string,
): Promise<GenerateResult> {
  return new Promise((resolve, reject) => {
    const prompt = buildPrompt(figmaUrl, nodeId, componentName);
    const cwd = path.resolve(STORYBOOK_ROOT);
    const storyFile = `${COMPONENTS_ROOT}/${componentName}/${componentName}.stories.tsx`;

    console.log(`[generate] Spawning claude in ${cwd}`);
    console.log(`[generate] Component: ${componentName}`);

    const child = spawn('claude', ['--print', prompt], {
      cwd,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(`[claude] ${text}`);
    });

    child.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(`[claude:err] ${text}`);
    });

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Claude timed out after ${CLAUDE_TIMEOUT_MS}ms`));
    }, CLAUDE_TIMEOUT_MS);

    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve({ file: storyFile, output: stdout });
      } else {
        reject(new Error(`Claude exited with code ${code}: ${stderr || stdout}`));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(new Error(`Failed to spawn claude: ${err.message}`));
    });
  });
}
