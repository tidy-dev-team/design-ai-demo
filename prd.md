# PRD — Figma → Storybook Story Generator

**Status:** Draft  
**Version:** 0.1  
**Author:** TBD  
**Last updated:** 2026-03-22

---

## 1. Problem statement

Developers on the design system team must hand-translate Figma component specs into Storybook stories manually. This is slow, error-prone, and creates drift between design and code. The goal is to eliminate that translation step by letting Claude Code read a Figma component directly and write the story file automatically.

---

## 2. Goals

- A developer selects a component in Figma, clicks one button, and gets a working `.stories.ts` file in their codebase within seconds.
- The generated story covers all documented variants (controlled by Figma component properties).
- The flow works locally today and can be promoted to a CI/CD pipeline with minimal changes.

### Non-goals (v1)

- Auto-publishing to Chromatic or GitHub Pages (planned for v2).
- Generating the React component itself — only the story wrapper.
- Support for non-TypeScript projects.
- Multi-framework output (React only for now).

---

## 3. Users

**Primary:** Frontend developers who maintain the design system and write Storybook stories today.

**Secondary:** Designers who want to verify that a component they finished in Figma has a working story without waiting for a developer.

---

## 4. High-level flow

```
[Figma plugin]
  User selects component → clicks "Generate story"
      ↓  POST { figmaUrl, nodeId, componentName }
[Local HTTP server]  (Node.js, port configurable)
  Validates request → spawns Claude Code
      ↓  claude --print "..."
[Claude Code + Figma MCP]
  Reads component via Figma MCP
  Resolves component name → codebase file path
  Writes ComponentName.stories.ts
      ↓
[Storybook]
  Hot-reloads → story visible in browser
```

---

## 5. Components

### 5.1 Figma plugin

**Trigger:** Button in plugin panel labeled "Generate story".

**On click:**
1. Read the currently selected node (`figma.currentPage.selection[0]`).
2. Construct the Figma component URL: `https://www.figma.com/file/{fileKey}?node-id={nodeId}`.
3. POST to the local server:
   ```json
   {
     "figmaUrl": "https://www.figma.com/file/...",
     "nodeId": "123:456",
     "componentName": "ButtonPrimary"
   }
   ```
4. Show status in plugin UI: `Generating…` → `Done — ButtonPrimary.stories.ts created` or error message.

**Error states:**
- Nothing selected → "Please select a component first."
- Local server unreachable → "Local server not running. Start it with `npm run story-server`."
- Server returns error → display the error message from server response.

**Configuration (plugin settings panel):**
- Server URL (default: `http://localhost:3333`)
- Target branch / working directory (optional hint passed to Claude Code)

---

### 5.2 Local HTTP server

**Runtime:** Node.js 18+, plain `http` module or Express.  
**Default port:** `3333` (configurable via `.env`).

**Endpoints:**

`POST /generate`
- Accepts the JSON payload from the plugin.
- Validates that `figmaUrl`, `nodeId`, and `componentName` are present.
- Spawns Claude Code **with `cwd` set to the Storybook project root** (configured via `STORYBOOK_ROOT` env var):
  ```js
  spawn('claude', ['--print', prompt], {
    cwd: process.env.STORYBOOK_ROOT,
    env: process.env
  })
  ```
- Streams Claude Code stdout to its own console for developer visibility.
- Returns `{ status: "ok", file: "src/stories/ButtonPrimary.stories.ts" }` on success.
- Returns `{ status: "error", message: "..." }` on failure.

`GET /health`
- Returns `{ status: "ok" }`. Used by the plugin to check liveness before sending a generate request.

**Security:** Binds to `127.0.0.1` only. No auth needed for local-only v1.

---

### 5.3 Claude Code invocation

**Working directory:** Claude Code is always spawned from the **Storybook project root** (`cwd` set explicitly in the `spawn` call). This is required so that Claude Code's file tools resolve paths relative to the project, and so it can read and search the existing component library.

**Mode:** Non-interactive (`claude --print`).  
**MCP dependency:** Figma MCP must be configured in Claude Code's MCP settings before first use.

**Prompt contract — what the prompt must tell Claude Code:**
1. The Figma URL and node ID to inspect.
2. To first scan `src/components/` (or configured `COMPONENTS_ROOT`) and build a mental map of what components already exist before writing anything.
3. The story it generates must **only import and compose existing components** — it must not invent new JSX, inline styles, or placeholder markup.
4. To map Figma component properties → existing component props (names may differ; Claude Code must reconcile them).
5. The target output path: `src/stories/<ComponentName>.stories.ts`.
6. The story format: Storybook CSF3, TypeScript, `@storybook/react`.
7. To cover all variants exposed as Figma component properties.

**Prompt template:**
```
You are working inside the Storybook project at the current directory.

1. Read the Figma component at <figmaUrl> (node <nodeId>) using the Figma MCP.
2. Scan src/components/ to find all existing components and their exported props/types.
3. Map the Figma component's name and variants to the best-matching existing component(s).
4. Write a Storybook CSF3 story file at src/stories/<ComponentName>.stories.ts.

Rules:
- Import ONLY from existing components found in step 2. Do not create new components.
- Derive args exclusively from the real TypeScript prop types of the matched component.
- Cover every variant documented in the Figma component properties.
- If no matching component exists, write the story with a prominent TODO comment 
  and leave the import path as `// TODO: import { <ComponentName> } from '...'`.
- Add the file header: // Auto-generated by Figma → Storybook pipeline. Review before merging.
```

**Expected output:** Claude Code writes the file directly to disk using its file write tool. It does not return file content in stdout.

**Fallback:** If Claude Code cannot confidently match a Figma component to an existing codebase component, it writes the story shell with TODO markers rather than hallucinating a component API.

---

### 5.4 Story file conventions

Generated files must follow these rules so they integrate with the existing Storybook setup without modification:

- Format: CSF3 (Component Story Format 3)
- Language: TypeScript strict
- Import source: resolved from actual codebase (not hardcoded)
- One `default` export with `title`, `component`, and `tags: ['autodocs']`
- One named export per Figma variant (PascalCase)
- `args` derived from Figma component properties
- No inline styles — use component props only
- File header comment: `// Auto-generated by Figma → Storybook pipeline. Review before merging.`

**Example output:**
```ts
// Auto-generated by Figma → Storybook pipeline. Review before merging.
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: 'primary', label: 'Click me' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', label: 'Delete' },
};
```

---

## 6. Setup & configuration

### Prerequisites
- Node.js 18+
- Claude Code CLI installed and authenticated
- Figma MCP configured in Claude Code settings
- Storybook running locally (`npm run storybook`)

### One-time setup
1. Install and run the local server: `npm run story-server`
2. Install the Figma plugin from the local manifest or published plugin ID
3. In plugin settings, verify server URL is `http://localhost:3333`

### Environment variables (`.env` in server root)
```
PORT=3333
STORYBOOK_ROOT=/path/to/your/storybook-project
STORIES_ROOT=src/stories
COMPONENTS_ROOT=src/components
CLAUDE_TIMEOUT_MS=60000
```

---

## 7. v2 / CI upgrade path

When the team is ready to move to an automated pipeline:

1. **Replace the Figma plugin trigger** with a Figma webhook on component publish events, or a manual GitHub Actions `workflow_dispatch`.
2. **Replace the local server** with a GitHub Actions job that runs the same Claude Code invocation.
3. **Add Chromatic** as a post-step: on story file creation, open a PR, run Chromatic on it, post the visual diff URL as a PR comment.
4. **No changes needed** to the Claude Code prompt, story conventions, or MCP setup.

---

## 8. Open questions

| # | Question | Owner | Due |
|---|----------|-------|-----|
| 1 | Which Storybook version is in use — 7.x or 8.x? CSF3 is supported in both but arg types differ. | Dev | Before build |
| 2 | Does the team use a component name → file path convention (e.g. `ButtonPrimary` → `src/components/Button/index.tsx`) or flat? | Dev | Before build |
| 3 | Should the plugin work when Figma is in browser, or desktop app only? Affects localhost fetch policy. | Dev | Before build |
| 4 | Is Figma MCP already installed and authenticated on all dev machines, or does this need onboarding docs? | DevOps | Before rollout |
| 5 | Who reviews generated stories before they're committed — author only, or a required reviewer? | Team | Before rollout |

---

## 9. Out of scope

- Updating existing stories (v1 creates new files only; overwrites are manual)
- Generating Figma component data without MCP (REST API fallback)
- Support for Vue, Svelte, or Angular
- Generating Playwright / interaction tests
- Design token sync (separate system)
