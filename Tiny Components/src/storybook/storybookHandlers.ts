import { on, emit } from "@create-figma-plugin/utilities";
import type {
  StorybookSelectionData,
  StorybookGenerateStoryHandler,
  StorybookGenerateResultHandler,
  StorybookSelectionChangeHandler,
  StorybookOpenHandler,
  StorybookOpenResultHandler,
} from "../types";
import {
  STORYBOOK_GENERATE_STORY,
  STORYBOOK_GENERATE_RESULT,
  STORYBOOK_SELECTION_CHANGE,
  STORYBOOK_OPEN,
  STORYBOOK_OPEN_RESULT,
} from "../types";
import { ENV } from "../env";

const VALID_TYPES: string[] = [
  "COMPONENT",
  "COMPONENT_SET",
  "INSTANCE",
  "FRAME",
  "SECTION",
];

function getStorybookSelectionData(): StorybookSelectionData | null {
  const sel = figma.currentPage.selection[0];
  if (!sel) return null;
  if (!VALID_TYPES.includes(sel.type)) return null;

  const nodeId = sel.id;
  const fileKey = figma.fileKey || ENV.FigmaFileKey;
  const figmaUrl = `https://www.figma.com/design/${fileKey}/file?node-id=${nodeId.replace(":", "-")}`;

  let raw = sel.name;
  if (sel.type === "INSTANCE") {
    const main = (sel as InstanceNode).mainComponent;
    if (main)
      raw =
        main.parent?.type === "COMPONENT_SET" ? main.parent.name : main.name;
  } else if (sel.type === "COMPONENT") {
    const parent = sel.parent;
    if (parent && parent.type === "COMPONENT_SET") {
      raw = parent.name;
    }
  }

  const componentName = raw
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

  return { figmaUrl, nodeId, componentName };
}

export function sendStorybookSelection(): void {
  emit<StorybookSelectionChangeHandler>(
    STORYBOOK_SELECTION_CHANGE,
    getStorybookSelectionData()
  );
}

export function initStorybookHandlers(): void {
  on<StorybookGenerateStoryHandler>(
    STORYBOOK_GENERATE_STORY,
    async (data: StorybookSelectionData) => {
      try {
        const resp = await fetch(`${ENV.ServerURL}/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const json = await resp.json();

        if (json.status === "ok") {
          emit<StorybookGenerateResultHandler>(STORYBOOK_GENERATE_RESULT, {
            status: "ok",
            message: `${json.file} created`,
          });
        } else {
          emit<StorybookGenerateResultHandler>(STORYBOOK_GENERATE_RESULT, {
            status: "error",
            message: json.message || "Server returned an error",
          });
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Could not reach server";
        emit<StorybookGenerateResultHandler>(STORYBOOK_GENERATE_RESULT, {
          status: "error",
          message: `Local server not running. Start it with \`npm run dev\`. (${message})`,
        });
      }
    }
  );

  on<StorybookOpenHandler>(STORYBOOK_OPEN, async () => {
    try {
      const resp = await fetch(`${ENV.ServerURL}/open-storybook`, {
        method: "POST",
      });
      const json = await resp.json();
      emit<StorybookOpenResultHandler>(STORYBOOK_OPEN_RESULT, json);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not reach server";
      emit<StorybookOpenResultHandler>(STORYBOOK_OPEN_RESULT, {
        status: "error",
        message,
      });
    }
  });

  sendStorybookSelection();
}
