import {
  Banner,
  Button,
  Disclosure,
  IconWarning16,
  Muted,
  Text,
  Textbox,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import type {
  StorybookSelectionData,
  StorybookLoadSettingsHandler,
  StorybookSelectionChangeHandler,
  StorybookGenerateResultHandler,
  StorybookSaveSettingsHandler,
  StorybookGenerateStoryHandler,
} from "../types";
import {
  STORYBOOK_LOAD_SETTINGS,
  STORYBOOK_SELECTION_CHANGE,
  STORYBOOK_GENERATE_RESULT,
  STORYBOOK_SAVE_SETTINGS,
  STORYBOOK_GENERATE_STORY,
} from "../types";

type Status = "idle" | "generating" | "done" | "error";

export function StorybookPanel() {
  const [selection, setSelection] = useState<StorybookSelectionData | null>(
    null
  );
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [serverUrl, setServerUrl] = useState("http://localhost:3333");
  const [fileKey, setFileKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const offLoad = on<StorybookLoadSettingsHandler>(
      STORYBOOK_LOAD_SETTINGS,
      (settings) => {
        setServerUrl(settings.serverUrl);
        setFileKey(settings.fileKey);
      }
    );
    const offSelection = on<StorybookSelectionChangeHandler>(
      STORYBOOK_SELECTION_CHANGE,
      (data) => {
        setSelection(data);
        if (status !== "generating") {
          setStatus("idle");
          setMessage("");
        }
      }
    );
    const offResult = on<StorybookGenerateResultHandler>(
      STORYBOOK_GENERATE_RESULT,
      (result) => {
        if (result.status === "ok") {
          setStatus("done");
          setMessage(result.message);
        } else {
          setStatus("error");
          setMessage(result.message);
        }
      }
    );

    return () => {
      offLoad();
      offSelection();
      offResult();
    };
  }, []);

  const handleServerUrlChange = useCallback(
    (value: string) => {
      setServerUrl(value);
      emit<StorybookSaveSettingsHandler>(STORYBOOK_SAVE_SETTINGS, {
        serverUrl: value,
        fileKey,
      });
    },
    [fileKey]
  );

  const handleFileKeyChange = useCallback(
    (value: string) => {
      setFileKey(value);
      emit<StorybookSaveSettingsHandler>(STORYBOOK_SAVE_SETTINGS, {
        serverUrl,
        fileKey: value,
      });
    },
    [serverUrl]
  );

  const handleGenerate = useCallback(() => {
    if (!selection) return;
    setStatus("generating");
    setMessage("Generating story…");
    emit<StorybookGenerateStoryHandler>(STORYBOOK_GENERATE_STORY, selection);
  }, [selection]);

  return (
    <div style={{ padding: "12px 16px" }}>
      <VerticalSpace space="small" />

      <Disclosure
        open={showSettings}
        onClick={() => setShowSettings(!showSettings)}
        title="Settings"
      >
        <VerticalSpace space="small" />
        <Text>
          <Muted>Server URL</Muted>
        </Text>
        <VerticalSpace space="small" />
        <Textbox
          value={serverUrl}
          onValueInput={handleServerUrlChange}
          placeholder="http://localhost:3333"
        />

        <VerticalSpace space="medium" />

        <Text>
          <Muted>Figma File Key</Muted>
        </Text>
        <VerticalSpace space="small" />
        <Textbox
          value={fileKey}
          onValueInput={handleFileKeyChange}
          placeholder="e.g. 7LWL1TZvifdDf8Oz2AH1tZ"
        />
        <VerticalSpace space="small" />
      </Disclosure>

      <VerticalSpace space="large" />

      {!selection ? (
        <Banner icon={<IconWarning16 />}>
          Select a component, component set, or instance.
        </Banner>
      ) : (
        <Text>
          Selected: <strong>{selection.componentName}</strong>
        </Text>
      )}

      <VerticalSpace space="medium" />

      {status === "done" && (
        <Banner icon={<IconWarning16 />} variant="success">
          {message}
        </Banner>
      )}
      {status === "error" && (
        <Banner icon={<IconWarning16 />} variant="warning">
          {message}
        </Banner>
      )}
      {status === "generating" && (
        <Text>
          <Muted>{message}</Muted>
        </Text>
      )}

      <VerticalSpace space="large" />

      <Button
        fullWidth
        onClick={handleGenerate}
        disabled={!selection || status === "generating"}
      >
        {status === "generating" ? "Generating…" : "Generate Story"}
      </Button>

      <VerticalSpace space="small" />
    </div>
  );
}
