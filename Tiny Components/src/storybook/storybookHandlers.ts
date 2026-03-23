import { on, emit } from "@create-figma-plugin/utilities";
import type {
  StorybookSettings,
  StorybookSelectionData,
  StorybookSaveSettingsHandler,
  StorybookLoadSettingsHandler,
  StorybookGenerateStoryHandler,
  StorybookGenerateResultHandler,
  StorybookSelectionChangeHandler,
} from "../types";
import {
  STORYBOOK_SAVE_SETTINGS,
  STORYBOOK_LOAD_SETTINGS,
  STORYBOOK_GENERATE_STORY,
  STORYBOOK_GENERATE_RESULT,
  STORYBOOK_SELECTION_CHANGE,
} from "../types";

const VALID_TYPES: string[] = [
  "COMPONENT",
  "COMPONENT_SET",
  "INSTANCE",
  "FRAME",
  "SECTION",
];

let savedFileKey = "";

function getStorybookSelectionData(): StorybookSelectionData | null {
  const sel = figma.currentPage.selection[0];
  if (!sel) return null;
  if (!VALID_TYPES.includes(sel.type)) return null;

  const nodeId = sel.id;
  const fileKey = figma.fileKey || savedFileKey || "UNKNOWN";
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
  on<StorybookSaveSettingsHandler>(
    STORYBOOK_SAVE_SETTINGS,
    async (settings: StorybookSettings) => {
      await figma.clientStorage.setAsync("serverUrl", settings.serverUrl);
      await figma.clientStorage.setAsync("fileKey", settings.fileKey);
      savedFileKey = settings.fileKey;
      sendStorybookSelection();
    }
  );

  on<StorybookGenerateStoryHandler>(
    STORYBOOK_GENERATE_STORY,
    async (data: StorybookSelectionData) => {
      try {
        const serverUrl =
          (await figma.clientStorage.getAsync("serverUrl")) ||
          "http://localhost:3333";

        const resp = await fetch(`${serverUrl}/generate`, {
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

  // Load saved settings and send to UI
  Promise.all([
    figma.clientStorage.getAsync("serverUrl"),
    figma.clientStorage.getAsync("fileKey"),
  ]).then(([serverUrl, fileKey]) => {
    savedFileKey = (fileKey as string) || "";
    emit<StorybookLoadSettingsHandler>(STORYBOOK_LOAD_SETTINGS, {
      serverUrl: (serverUrl as string) || "http://localhost:3333",
      fileKey: (fileKey as string) || "",
    });
    sendStorybookSelection();
  });
}
