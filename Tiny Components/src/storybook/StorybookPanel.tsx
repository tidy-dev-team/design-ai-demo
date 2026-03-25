import {
  Banner,
  Button,
  IconWarning16,
  Muted,
  Text,
  VerticalSpace,
} from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";
import type {
  StorybookSelectionData,
  StorybookSelectionChangeHandler,
  StorybookGenerateResultHandler,
  StorybookGenerateStoryHandler,
  StorybookOpenHandler,
  StorybookOpenResultHandler,
} from "../types";
import {
  STORYBOOK_SELECTION_CHANGE,
  STORYBOOK_GENERATE_RESULT,
  STORYBOOK_GENERATE_STORY,
  STORYBOOK_OPEN,
  STORYBOOK_OPEN_RESULT,
} from "../types";

type Status = "idle" | "generating" | "done" | "error";

export function StorybookPanel() {
  const [selection, setSelection] = useState<StorybookSelectionData | null>(
    null
  );
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [storybookLoading, setStorybookLoading] = useState(false);

  useEffect(() => {
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

    const offOpen = on<StorybookOpenResultHandler>(
      STORYBOOK_OPEN_RESULT,
      (result) => {
        setStorybookLoading(false);
        if (result.status === "ok" && result.url) {
          window.open(result.url);
        }
      }
    );

    return () => {
      offSelection();
      offResult();
      offOpen();
    };
  }, []);

  const handleGenerate = useCallback(() => {
    if (!selection) return;
    setStatus("generating");
    setMessage("Generating story…");
    emit<StorybookGenerateStoryHandler>(STORYBOOK_GENERATE_STORY, selection);
  }, [selection]);

  const handleOpenStorybook = useCallback(() => {
    setStorybookLoading(true);
    emit<StorybookOpenHandler>(STORYBOOK_OPEN);
  }, []);

  return (
    <div style={{ padding: "12px 16px" }}>
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
        <div>
          <Banner icon={<IconWarning16 />} variant="success">
            {message}
          </Banner>
          <VerticalSpace space="small" />
          <Button
            fullWidth
            secondary
            onClick={handleOpenStorybook}
            disabled={storybookLoading}
          >
            {storybookLoading ? "Starting Storybook…" : "Open Storybook"}
          </Button>
        </div>
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
