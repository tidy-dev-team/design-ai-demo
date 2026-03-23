import {
  Button,
  Muted,
  VerticalSpace,
  render,
  TextboxAutocomplete,
} from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useState, useEffect, useCallback } from "preact/hooks";
import {
  FIND_COMPONENTS_EVENT,
  FindComponentsEventHandler,
  REPLACE_COMPONENTS_EVENT,
  ReplaceComponentsEventHandler,
  GET_SELECTION_EVENT,
  GetSelectionEventHandler,
  MAP_ELEMENTS_EVENT,
  MapElementsEventHandler,
  MAP_TEXT_PROP_EVENT,
  MapTextPropEventHandler,
  UNMAP_ELEMENT_EVENT,
  UnmapElementEventHandler,
  UNMAP_TEXT_PROP_EVENT,
  UnmapTextPropEventHandler,
  GET_MANUAL_MAPPINGS_EVENT,
  GetManualMappingsEventHandler,
  GET_TEXT_PROP_DEFINITIONS_EVENT,
  GetTextPropDefinitionsEventHandler,
  GET_TEXT_PROP_MAPPINGS_EVENT,
  GetTextPropMappingsEventHandler,
  MAPPINGS_UPDATED_EVENT,
  MappingsUpdatedEventHandler,
  TEXT_PROP_DEFINITIONS_UPDATED_EVENT,
  TextPropDefinitionsUpdatedEventHandler,
  TEXT_PROP_MAPPINGS_UPDATED_EVENT,
  TextPropMappingsUpdatedEventHandler,
  SELECTION_CHANGED_EVENT,
  SelectionChangedEventHandler,
  SELECT_MAPPED_NODE_EVENT,
  SelectMappedNodeEventHandler,
} from "./types";
import type { SelectionInfo, ManualMapping, TextPropMapping } from "./types";
import { getAllMappingIds } from "./componentData";

const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    padding: "16px",
    boxSizing: "border-box" as const,
    background: "linear-gradient(180deg, #fafbfc 0%, #f1f5f9 100%)",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    padding: "20px",
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05)",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "16px",
  },
  title: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#0f172a",
    marginBottom: "6px",
  },
  subtitle: {
    fontSize: "12px",
    lineHeight: "18px",
    color: "#64748b",
  },
  section: {
    marginTop: "16px",
  },
  sectionTitle: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: "10px",
  },
  selectionBox: (hasSelection: boolean, isMapped: boolean) => ({
    padding: "10px 12px",
    backgroundColor: isMapped
      ? "#fef3c7"
      : hasSelection
      ? "#ecfdf5"
      : "#f8fafc",
    borderRadius: "8px",
    border: `1px solid ${
      isMapped ? "#fcd34d" : hasSelection ? "#6ee7b7" : "#e2e8f0"
    }`,
    marginBottom: "12px",
  }),
  selectionLabel: {
    fontSize: "10px",
    fontWeight: 500,
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    letterSpacing: "0.3px",
    marginBottom: "4px",
  },
  selectionName: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#1e293b",
    lineHeight: "18px",
  },
  mappedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "6px",
    padding: "3px 8px",
    backgroundColor: "#fef3c7",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: 500,
    color: "#92400e",
  },
  mapRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  dropdownWrapper: {
    flex: 1,
  },
  mappingItem: (isHighlighted: boolean) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 12px",
    backgroundColor: isHighlighted ? "#fefce8" : "#ffffff",
    borderRadius: "8px",
    border: `1px solid ${isHighlighted ? "#fde047" : "#e2e8f0"}`,
    marginBottom: "6px",
    transition: "all 0.15s ease",
    cursor: "pointer",
  }),
  mappingText: {
    fontSize: "12px",
    lineHeight: "18px",
    color: "#334155",
    flex: 1,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
    whiteSpace: "nowrap" as const,
  },
  mappingArrow: {
    color: "#94a3b8",
    margin: "0 6px",
  },
  mappingTarget: {
    fontWeight: 600,
    color: "#0f172a",
  },
  removeButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    marginLeft: "8px",
    transition: "all 0.15s ease",
  },
  mappingsList: {
    maxHeight: "100%",
    overflowY: "auto" as const,
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "16px",
    color: "#94a3b8",
    fontSize: "12px",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    marginTop: "auto",
    paddingTop: "16px",
  },
  propMapBox: {
    padding: "10px 12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    marginBottom: "10px",
  },
  helperText: {
    fontSize: "11px",
    color: "#64748b",
    marginTop: "6px",
    lineHeight: "16px",
  },
};

function Plugin() {
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [mappings, setMappings] = useState<ManualMapping[]>([]);
  const [selectedMappingId, setSelectedMappingId] = useState<string>("");
  const [activePropFrameId, setActivePropFrameId] = useState<string>("");
  const [selectedTextPropName, setSelectedTextPropName] = useState<string>("");
  const [textPropOptionValues, setTextPropOptionValues] = useState<string[]>([]);
  const [textPropMappings, setTextPropMappings] = useState<TextPropMapping[]>(
    []
  );
  const [mappingOptionValues] = useState(() => getAllMappingIds());
  const mappingOptions = mappingOptionValues.map((id) => ({ value: id }));

  function handleFindComponentsClick() {
    emit<FindComponentsEventHandler>(FIND_COMPONENTS_EVENT);
  }

  function handleReplaceComponentsClick() {
    emit<ReplaceComponentsEventHandler>(REPLACE_COMPONENTS_EVENT);
  }

  function handleMapClick() {
    if (!selection || !selectedMappingId) return;
    emit<MapElementsEventHandler>(
      MAP_ELEMENTS_EVENT,
      selection.nodes.map((node) => node.nodeId),
      selectedMappingId
    );
    setSelectedMappingId("");
    refreshMappings();
  }

  function handleUnmapClick(nodeId: string) {
    emit<UnmapElementEventHandler>(UNMAP_ELEMENT_EVENT, nodeId);
    refreshMappings();
  }

  function handleSelectMappedNode(nodeId: string) {
    setActivePropFrameId(nodeId);
    emit<SelectMappedNodeEventHandler>(SELECT_MAPPED_NODE_EVENT, nodeId);
  }

  function handleUseSelectionForPropMapping() {
    if (!selectedMapping) return;
    setActivePropFrameId(selectedMapping.nodeId);
  }

  function handleMapTextProp() {
    if (!activePropFrameId || !selectedTextPropName) {
      return;
    }
    const textSelection = selectionNodes.filter((node) => node.nodeType === "TEXT");
    if (textSelection.length !== 1) {
      return;
    }
    emit<MapTextPropEventHandler>(
      MAP_TEXT_PROP_EVENT,
      activePropFrameId,
      selectedTextPropName,
      textSelection[0].nodeId
    );
    refreshTextPropMappings(activePropFrameId);
  }

  function handleUnmapTextProp(propName: string) {
    if (!activePropFrameId) return;
    emit<UnmapTextPropEventHandler>(
      UNMAP_TEXT_PROP_EVENT,
      activePropFrameId,
      propName
    );
    refreshTextPropMappings(activePropFrameId);
  }

  const refreshSelection = useCallback(() => {
    emit<GetSelectionEventHandler>(GET_SELECTION_EVENT);
  }, []);

  const refreshMappings = useCallback(() => {
    emit<GetManualMappingsEventHandler>(GET_MANUAL_MAPPINGS_EVENT);
  }, []);

  const refreshTextPropMappings = useCallback((frameId: string) => {
    if (!frameId) {
      setTextPropMappings([]);
      return;
    }
    emit<GetTextPropMappingsEventHandler>(GET_TEXT_PROP_MAPPINGS_EVENT, frameId);
  }, []);

  const refreshTextPropDefinitions = useCallback((frameId: string) => {
    if (!frameId) {
      setTextPropOptionValues([]);
      return;
    }
    emit<GetTextPropDefinitionsEventHandler>(
      GET_TEXT_PROP_DEFINITIONS_EVENT,
      frameId
    );
  }, []);

  useEffect(() => {
    const offSelectionChanged = on<SelectionChangedEventHandler>(
      SELECTION_CHANGED_EVENT,
      (info: SelectionInfo | null) => {
        setSelection(info);
      }
    );
    const offMappingsUpdated = on<MappingsUpdatedEventHandler>(
      MAPPINGS_UPDATED_EVENT,
      (nextMappings: ManualMapping[]) => {
        setMappings(nextMappings);
      }
    );
    const offTextPropMappingsUpdated = on<TextPropMappingsUpdatedEventHandler>(
      TEXT_PROP_MAPPINGS_UPDATED_EVENT,
      (frameId: string, nextMappings: TextPropMapping[]) => {
        if (frameId === activePropFrameId) {
          setTextPropMappings(nextMappings);
        }
      }
    );
    const offTextPropDefinitionsUpdated = on<TextPropDefinitionsUpdatedEventHandler>(
      TEXT_PROP_DEFINITIONS_UPDATED_EVENT,
      (frameId: string, propNames: string[]) => {
        if (frameId === activePropFrameId) {
          setTextPropOptionValues(propNames);
        }
      }
    );

    refreshSelection();
    refreshMappings();

    return () => {
      offSelectionChanged();
      offMappingsUpdated();
      offTextPropMappingsUpdated();
      offTextPropDefinitionsUpdated();
    };
  }, [activePropFrameId, refreshSelection, refreshMappings]);

  useEffect(() => {
    if (activePropFrameId) {
      const exists = mappings.some((mapping) => mapping.nodeId === activePropFrameId);
      if (!exists) {
        setActivePropFrameId("");
        setTextPropMappings([]);
        setTextPropOptionValues([]);
        setSelectedTextPropName("");
      }
    }
  }, [activePropFrameId, mappings]);

  useEffect(() => {
    refreshTextPropMappings(activePropFrameId);
    refreshTextPropDefinitions(activePropFrameId);
  }, [activePropFrameId, refreshTextPropDefinitions, refreshTextPropMappings]);

  const selectionNodes = selection?.nodes ?? [];
  const selectedNodeIds = new Set(selectionNodes.map((node) => node.nodeId));
  const frameSelectionCount = selectionNodes.filter(
    (node) => node.nodeType === "FRAME"
  ).length;
  const invalidSelectionCount = selectionNodes.length - frameSelectionCount;
  const canMapSelection = frameSelectionCount > 0;
  const selectedMapping =
    selectionNodes.length === 1
      ? mappings.find((m) => m.nodeId === selectionNodes[0].nodeId) ?? null
      : null;
  const selectionLabel =
    selectionNodes.length === 0
      ? "No Selection"
      : selectionNodes.length === 1
      ? "Selected Layer"
      : `Selected Layers (${selectionNodes.length})`;
  const selectionName =
    selectionNodes.length === 0
      ? "Select one or more frames on canvas"
      : selectionNodes.length === 1
      ? `${selectionNodes[0].nodeName} (${selectionNodes[0].nodeType})`
      : `${selectionNodes.slice(0, 2).map((n) => n.nodeName).join(", ")}${
          selectionNodes.length > 2 ? ` +${selectionNodes.length - 2} more` : ""
        }`;
  const mapButtonLabel =
    frameSelectionCount > 1 ? `Map ${frameSelectionCount} Frames` : "Map";
  const activePropFrame =
    mappings.find((mapping) => mapping.nodeId === activePropFrameId) ?? null;
  const textPropOptions = textPropOptionValues.map((value) => ({ value }));
  const mappedPropNames = new Set(textPropMappings.map((mapping) => mapping.propName));
  const selectedTextNodes = selectionNodes.filter((node) => node.nodeType === "TEXT");
  const selectedTextNodeLabel =
    selectedTextNodes.length === 1
      ? selectedTextNodes[0].nodeName
      : selectedTextNodes.length > 1
      ? "Multiple TEXT layers selected"
      : "No TEXT layer selected";
  const isSelectedTextPropMapped = mappedPropNames.has(selectedTextPropName);
  const canMapTextProp =
    !!activePropFrame &&
    !!selectedTextPropName &&
    selectedTextNodes.length === 1 &&
    !isSelectedTextPropMapped;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.title}>Tiny Components</div>
          <div style={styles.subtitle}>
            Replace placeholders with polished DS components
          </div>
        </div>

        {/* Manual Mapping Section */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Manual Mapping</div>

          {/* Selection Box */}
          <div style={styles.selectionBox(!!selection, !!selectedMapping)}>
            <div style={styles.selectionLabel}>
              {selectionLabel}
            </div>
            <div style={styles.selectionName}>
              {selectionName}
            </div>
            {selectionNodes.length > 0 && !canMapSelection && (
              <div style={styles.mappedBadge}>
                <span>FRAME-only mapping</span>
              </div>
            )}
            {invalidSelectionCount > 0 && canMapSelection && (
              <div style={styles.mappedBadge}>
                <span>
                  {invalidSelectionCount} non-frame{" "}
                  {invalidSelectionCount === 1 ? "layer" : "layers"} will be
                  skipped
                </span>
              </div>
            )}
            {selectedMapping && (
              <div style={styles.mappedBadge}>
                <span>Mapped to:</span>
                <strong>{selectedMapping.mappingId}</strong>
              </div>
            )}
          </div>

          {/* Map Controls */}
          <div style={styles.mapRow}>
            <div style={styles.dropdownWrapper}>
              <TextboxAutocomplete
                filter
                strict
                options={mappingOptions}
                value={selectedMappingId}
                placeholder="Select component..."
                onValueInput={setSelectedMappingId}
                disabled={!canMapSelection}
              />
            </div>
            <Button
              secondary
              onClick={handleMapClick}
              disabled={!canMapSelection || !selectedMappingId}
            >
              {mapButtonLabel}
            </Button>
          </div>
        </div>

        {/* Current Mappings */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Mappings ({mappings.length})</div>

          {mappings.length === 0 ? (
            <div style={styles.emptyState}>
              <Muted>No mappings yet</Muted>
            </div>
          ) : (
            <div style={styles.mappingsList}>
              {mappings.map((m) => {
                const isHighlighted = selectedNodeIds.has(m.nodeId);
                return (
                  <div
                    key={m.nodeId}
                    style={styles.mappingItem(isHighlighted)}
                    onClick={() => handleSelectMappedNode(m.nodeId)}
                  >
                    <div style={styles.mappingText}>
                      <span>{m.nodeName}</span>
                      <span style={styles.mappingArrow}> → </span>
                      <span style={styles.mappingTarget}>{m.mappingId}</span>
                    </div>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleUnmapClick(m.nodeId);
                      }}
                      style={styles.removeButton}
                      title="Remove mapping"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Prop Mapping Section */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Map Props (Text)</div>
          <div style={styles.propMapBox}>
            <div style={styles.selectionLabel}>Target frame</div>
            <div style={styles.selectionName}>
              {activePropFrame
                ? `${activePropFrame.nodeName} (${activePropFrame.mappingId})`
                : "Pick a mapped frame first"}
            </div>
            <div style={styles.helperText}>
              Click a mapping row above or use button from current single-frame selection.
            </div>
            <VerticalSpace space="small" />
            <Button
              secondary
              fullWidth
              disabled={!selectedMapping}
              onClick={handleUseSelectionForPropMapping}
            >
              Use Selected Frame
            </Button>
            {activePropFrame && (
              <div>
                <VerticalSpace space="small" />
                <div style={styles.selectionLabel}>Text property</div>
                <TextboxAutocomplete
                  filter
                  strict
                  options={textPropOptions}
                  value={selectedTextPropName}
                  placeholder="Select text prop..."
                  onValueInput={setSelectedTextPropName}
                  disabled={!activePropFrame}
                />
                <div style={styles.helperText}>
                  Source layer: {selectedTextNodeLabel}
                </div>
                {isSelectedTextPropMapped && (
                  <div style={styles.mappedBadge}>
                    <span>Property already mapped. Remove it first.</span>
                  </div>
                )}
                <VerticalSpace space="small" />
                <Button fullWidth onClick={handleMapTextProp} disabled={!canMapTextProp}>
                  Map Prop
                </Button>
              </div>
            )}
          </div>

          {activePropFrame && (
            <div>
              <div style={styles.selectionLabel}>
                Existing prop mappings ({textPropMappings.length})
              </div>
              {textPropMappings.length === 0 ? (
                <div style={styles.emptyState}>
                  <Muted>No text props mapped for this frame</Muted>
                </div>
              ) : (
                <div style={styles.mappingsList}>
                  {textPropMappings.map((mapping) => (
                    <div key={mapping.propName} style={styles.mappingItem(false)}>
                      <div style={styles.mappingText}>
                        <span style={styles.mappingTarget}>{mapping.propName}</span>
                        <span style={styles.mappingArrow}> ← </span>
                        <span>{mapping.sourceNodeName}</span>
                      </div>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleUnmapTextProp(mapping.propName);
                        }}
                        style={styles.removeButton}
                        title="Remove prop mapping"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                        >
                          <path
                            d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Primary Actions */}
        <div style={styles.buttonGroup}>
          <Button secondary fullWidth onClick={handleFindComponentsClick}>
            Find Components
          </Button>
          <Button fullWidth onClick={handleReplaceComponentsClick}>
            Replace from DS
          </Button>
        </div>
      </div>

      <VerticalSpace space="small" />
    </div>
  );
}

export default render(Plugin);
