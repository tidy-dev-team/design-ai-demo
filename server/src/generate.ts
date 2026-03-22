import { exec } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildPrompt } from './prompt.js';

const STORYBOOK_ROOT = process.env.STORYBOOK_ROOT || '../storybook';
const CLAUDE_TIMEOUT_MS = Number(process.env.CLAUDE_TIMEOUT_MS) || 300000;
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
    const screenDir = `${COMPONENTS_ROOT}/${componentName}`;

    const promptFile = path.join(tmpdir(), `claude-prompt-${Date.now()}.txt`);
    writeFileSync(promptFile, prompt);

    const shellCmd = `cat "${promptFile}" | /Users/dmitridmitriev/.local/bin/claude -p --permission-mode acceptEdits --allowedTools 'Write,Edit,Read,Glob,Grep,Bash,mcp__plugin_figma_figma__get_design_context,mcp__plugin_figma_figma__get_screenshot' 2>&1`;

    console.log(`[generate] cwd: ${cwd}`);
    console.log(`[generate] Screen: ${componentName} → ${screenDir}/`);
    console.log(`[generate] Timeout: ${CLAUDE_TIMEOUT_MS}ms`);
    console.log(`[generate] Prompt: ${prompt.length} chars`);
    console.log(`[generate] Running claude...`);

    const child = exec(shellCmd, {
      cwd,
      env: process.env,
      maxBuffer: 10 * 1024 * 1024,
      timeout: CLAUDE_TIMEOUT_MS,
    }, (error, stdout, stderr) => {
      try { unlinkSync(promptFile); } catch {}

      if (error) {
        console.error(`[generate] Error: ${error.message}`);
        console.log(`[generate] stdout: ${stdout.length} chars`);
        if (stdout) console.log(`[generate] stdout preview: ${stdout.slice(0, 300)}`);
        reject(new Error(error.message));
        return;
      }

      console.log(`[generate] Done. Output: ${stdout.length} chars`);
      resolve({ file: screenDir, output: stdout });
    });

    // Stream output in realtime
    child.stdout?.on('data', (chunk: Buffer) => {
      process.stdout.write(`[claude] ${chunk.toString()}`);
    });

    child.stderr?.on('data', (chunk: Buffer) => {
      process.stderr.write(`[claude:err] ${chunk.toString()}`);
    });
  });
}
