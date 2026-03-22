# DemoDesignAI — Figma Layout to Storybook Screen Generator

Turn a Figma layout frame into a working React screen component in Storybook with one click.

## What it does

You have a **component library** in Storybook (buttons, cards, nav panels, etc.) and a **screen layout** in Figma that arranges those components. This tool bridges the gap: it reads the Figma layout, identifies which components are used, and writes a screen component that composes them — plus its CSS module and Storybook story.

### Before and after

```
BEFORE (manual)                          AFTER (automated)
─────────────────                        ──────────────────
1. Open Figma design                     1. Select frame in Figma
2. Identify which components are used    2. Click "Generate Story"
3. Create a new .tsx file                3. Done — 3 files created
4. Import each component
5. Wire up props from the design
6. Write layout CSS
7. Create a Storybook story
```

## How it works

```
┌─────────────────────┐
│     Figma Plugin     │  Developer selects a layout frame,
│  (plugin-storybook)  │  clicks "Generate Story"
└─────────┬───────────┘
          │ POST /generate
          │ { figmaUrl, nodeId, componentName }
          ▼
┌─────────────────────┐
│   Local HTTP Server  │  Validates request, builds prompt
│      (server)        │  with component inventory baked in
└─────────┬───────────┘
          │ pipes prompt to stdin
          ▼
┌─────────────────────┐
│    Claude Code CLI   │  1. Reads Figma design via MCP
│   (-p mode + tools)  │     (gets screenshot + structure)
│                      │  2. Maps Figma children to existing
│                      │     Storybook components
│                      │  3. Writes 3 files:
└─────────┬───────────┘     • ComponentName.tsx
          │                 • ComponentName.module.css
          │                 • ComponentName.stories.tsx
          ▼
┌─────────────────────┐
│      Storybook       │  Hot-reloads automatically.
│  (storybook project) │  New screen visible in browser.
└─────────────────────┘
```

### What gets generated

Given a Figma frame called "DashboardV2" containing a nav panel, search bar, KPI cards, and a side banner:

```
src/components/DashboardV2/
├── DashboardV2.tsx          ← React component composing existing components
├── DashboardV2.module.css   ← Layout-only styles (flexbox, grid, spacing)
└── DashboardV2.stories.tsx  ← Storybook story (CSF3, fullscreen, autodocs)
```

The generated `.tsx` file imports only from your existing component library — it does not create new primitive components.

## Project structure

```
DemoDesignAI/
├── plugin-storybook/    Figma plugin (Preact UI + plugin API)
├── server/              Local Node.js server (Express)
├── storybook/           React + Storybook project with component library
└── prd.md               Product requirements document
```

## Setup

### Prerequisites

- **Node.js 18+**
- **Claude Code CLI** installed and authenticated (`claude --version` should work)
- **Figma MCP** configured in Claude Code's MCP settings (needed to read Figma designs)
- **Figma desktop app** with developer mode

### 1. Install dependencies

```bash
# Server
cd server
npm install
cp .env.example .env    # edit paths if needed

# Storybook
cd ../storybook
npm install

# Plugin
cd ../plugin-storybook
npm install
```

### 2. Configure environment

Edit `server/.env`:

```env
PORT=3333                  # Server port
STORYBOOK_ROOT=../storybook   # Path to your Storybook project
COMPONENTS_ROOT=src/components # Where components live (relative to STORYBOOK_ROOT)
CLAUDE_TIMEOUT_MS=300000       # 5 minutes — layout generation takes time
```

### 3. Install the Figma plugin

1. Open the Figma desktop app
2. Go to **Plugins > Development > Import plugin from manifest**
3. Select `plugin-storybook/manifest.json`

### 4. Start the services

Open two terminals:

```bash
# Terminal 1 — Storybook
cd storybook
npm run storybook

# Terminal 2 — Server
cd server
npm run dev
```

## Usage

1. Open your Figma file
2. **Select a layout frame** (a frame that contains component instances arranged as a screen)
3. Open the plugin: **Plugins > DemoDesignAI**
4. Verify the server URL and file key are set
5. Click **"Generate Story"**
6. Wait for the status to show success (~30-90 seconds)
7. Check Storybook — your new screen appears under **UI Screens/**

### What the plugin accepts

The plugin accepts these Figma node types as input:

| Type | Use case |
|------|----------|
| **Frame** | Layout containing component instances (primary use case) |
| **Section** | Same as frame — a grouping container |
| **Component / Component Set** | Single component (generates a screen with just that component) |
| **Instance** | Resolves to its main component |

## How the prompt works

The server builds a prompt for Claude Code that includes:

1. **The Figma URL and node ID** — so Claude can read the design via MCP
2. **A pre-computed component inventory** — every component name, its props interface, and import path. This is baked into the prompt so Claude doesn't need to scan the filesystem (saves tokens and time).
3. **A reference example** — a condensed version of an existing screen component showing the exact pattern to follow
4. **Rules** — import only existing components, use CSS modules, no Tailwind, no inline styles

Claude then:
- Calls the Figma MCP to get a screenshot and structure of the layout
- Matches Figma children to the component inventory
- Writes 3 files using the Write tool

## Architecture decisions

| Decision | Why |
|----------|-----|
| **Component inventory in prompt** | Avoids 20+ file-scanning tool calls. Saves tokens, faster. |
| **`exec` with shell pipe** | `spawn` with `tsx watch` had buffering issues. Shell pipe works reliably. |
| **`--permission-mode acceptEdits`** | Allows Claude to write files without interactive approval in headless mode. |
| **CSS modules, not Tailwind** | Matches the existing codebase convention. |
| **Layout-only CSS** | Generated CSS handles positioning; child component styling stays in each component's own module. |

## Troubleshooting

### "Claude timed out"
- Increase `CLAUDE_TIMEOUT_MS` in `server/.env` (default is 300000ms = 5 min)
- Check that Claude Code CLI is authenticated: `claude -p "hello"` should respond

### "Could not reach server"
- Make sure the server is running: `cd server && npm run dev`
- Check the port matches plugin settings (default: `http://localhost:3333`)

### Figma MCP errors / "node rejected as invalid"
- Verify Figma MCP is configured in Claude Code settings
- Make sure the File Key in the plugin settings matches your Figma file
- Try re-selecting the frame in Figma

### Plugin doesn't show the selected frame
- Make sure you're selecting a **Frame**, **Section**, or **Component** node (not a group or vector)
- Check that the File Key is set in the plugin settings panel

## Development

```bash
# Rebuild the Figma plugin after changes
cd plugin-storybook && npm run build

# Server auto-reloads via tsx watch
cd server && npm run dev

# Run Storybook
cd storybook && npm run storybook
```
