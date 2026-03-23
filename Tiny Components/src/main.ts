import { on, showUI, emit } from "@create-figma-plugin/utilities";
import {
  findMappingForFrame,
  getComponentByKey,
  getMappingById,
} from "./componentData";
import { extractFrameContent } from "./extraction/frameAnalyzer";
import { applyProperties } from "./replacement/propertyApplicator";
import {
  initStorybookHandlers,
  sendStorybookSelection,
} from "./storybook/storybookHandlers";
import type {
  ComponentMapping,
  ManualMapping,
  SelectionInfo,
  TextPropMapping,
  ResizeUiHandler,
} from "./types";
import {
  FIND_COMPONENTS_EVENT,
  FindComponentsEventHandler,
  GET_MANUAL_MAPPINGS_EVENT,
  GetManualMappingsEventHandler,
  GET_TEXT_PROP_DEFINITIONS_EVENT,
  GetTextPropDefinitionsEventHandler,
  GET_TEXT_PROP_MAPPINGS_EVENT,
  GetTextPropMappingsEventHandler,
  GET_SELECTION_EVENT,
  GetSelectionEventHandler,
  MAP_ELEMENTS_EVENT,
  MapElementsEventHandler,
  MAP_TEXT_PROP_EVENT,
  MapTextPropEventHandler,
  REPLACE_COMPONENTS_EVENT,
  ReplaceComponentsEventHandler,
  MAPPINGS_UPDATED_EVENT,
  MappingsUpdatedEventHandler,
  SELECTION_CHANGED_EVENT,
  SelectionChangedEventHandler,
  SELECT_MAPPED_NODE_EVENT,
  SelectMappedNodeEventHandler,
  TEXT_PROP_MAPPINGS_UPDATED_EVENT,
  TEXT_PROP_DEFINITIONS_UPDATED_EVENT,
  TextPropDefinitionsUpdatedEventHandler,
  TextPropMappingsUpdatedEventHandler,
  UNMAP_ELEMENT_EVENT,
  UnmapElementEventHandler,
  UNMAP_TEXT_PROP_EVENT,
  UnmapTextPropEventHandler,
  RESIZE_UI_EVENT,
} from "./types";

const componentCache = new Map<string, ComponentSetNode | ComponentNode>();
const manualMappings = new Map<string, string>();
const textPropMappings = new Map<string, Map<string, StoredTextPropBinding>>();
const mappingTextPropNamesCache = new Map<string, string[]>();
const MANUAL_MAPPINGS_STORAGE_KEY = "tiny-components-manual-mappings-v1";
const TEXT_PROP_MAPPINGS_STORAGE_KEY = "tiny-components-text-prop-mappings-v1";

interface StoredTextPropBinding {
  sourceNodeId: string;
  sourceNodeName: string;
  sourcePath: number[];
}

const UI_WIDTH = 320;
const TAB_HEIGHTS: Record<string, number> = {
  components: 860,
  storybook: 440,
};

export default function () {
  showUI({
    height: TAB_HEIGHTS.components,
    width: UI_WIDTH,
  });

  on<FindComponentsEventHandler>(FIND_COMPONENTS_EVENT, handleFindComponents);
  on<ReplaceComponentsEventHandler>(
    REPLACE_COMPONENTS_EVENT,
    handleReplaceComponents
  );
  on<GetSelectionEventHandler>(GET_SELECTION_EVENT, () => {
    const selection = handleGetSelection();
    emit<SelectionChangedEventHandler>(SELECTION_CHANGED_EVENT, selection);
    return selection;
  });
  on<MapElementsEventHandler>(MAP_ELEMENTS_EVENT, handleMapElements);
  on<UnmapElementEventHandler>(UNMAP_ELEMENT_EVENT, handleUnmapElement);
  on<SelectMappedNodeEventHandler>(
    SELECT_MAPPED_NODE_EVENT,
    handleSelectMappedNode
  );
  on<GetManualMappingsEventHandler>(GET_MANUAL_MAPPINGS_EVENT, () => {
    const mappings = handleGetManualMappings();
    emit<MappingsUpdatedEventHandler>(MAPPINGS_UPDATED_EVENT, mappings);
    return mappings;
  });
  on<GetTextPropMappingsEventHandler>(
    GET_TEXT_PROP_MAPPINGS_EVENT,
    (frameId: string) => {
      const mappings = handleGetTextPropMappings(frameId);
      emit<TextPropMappingsUpdatedEventHandler>(
        TEXT_PROP_MAPPINGS_UPDATED_EVENT,
        frameId,
        mappings
      );
      return mappings;
    }
  );
  on<GetTextPropDefinitionsEventHandler>(
    GET_TEXT_PROP_DEFINITIONS_EVENT,
    async (frameId: string) => {
      const propNames = await getLiveTextPropNamesForFrame(frameId);
      emit<TextPropDefinitionsUpdatedEventHandler>(
        TEXT_PROP_DEFINITIONS_UPDATED_EVENT,
        frameId,
        propNames
      );
      return propNames;
    }
  );
  on<MapTextPropEventHandler>(MAP_TEXT_PROP_EVENT, handleMapTextProp);
  on<UnmapTextPropEventHandler>(UNMAP_TEXT_PROP_EVENT, handleUnmapTextProp);

  // Storybook feature handlers
  initStorybookHandlers();

  // Dynamic resize when switching tabs
  on<ResizeUiHandler>(RESIZE_UI_EVENT, (tab: string) => {
    const height = TAB_HEIGHTS[tab] ?? TAB_HEIGHTS.components;
    figma.ui.resize(UI_WIDTH, height);
  });

  // Unified selection change handler — dispatches to both subsystems
  figma.on("selectionchange", () => {
    const selection = handleGetSelection();
    emit<SelectionChangedEventHandler>(SELECTION_CHANGED_EVENT, selection);
    sendStorybookSelection();
  });

  void hydrateManualMappings();
  void hydrateTextPropMappings();
}

/**
 * Finds all frames that match any component mapping and selects them.
 */
function handleFindComponents() {
  const matchingFrames = findMatchingFrames();

  if (matchingFrames.length === 0) {
    figma.currentPage.selection = [];
    figma.notify("No matching frames found on this page.");
    return;
  }

  figma.currentPage.selection = matchingFrames;
  figma.viewport.scrollAndZoomIntoView(matchingFrames);
  const suffix = matchingFrames.length === 1 ? "frame" : "frames";
  figma.notify(`Selected ${matchingFrames.length} ${suffix}`);
}

/**
 * Replaces all matching frames with their corresponding DS components.
 * Priority: manual mappings > name-based matching
 */
async function handleReplaceComponents() {
  const framesToReplace = collectFramesToReplace();

  if (framesToReplace.length === 0) {
    figma.notify("No matching frames found on this page.");
    return;
  }

  const replacements: Array<{
    instance: InstanceNode;
    mapping: ComponentMapping;
  }> = [];
  let skipped = 0;

  for (const { frame, mapping } of framesToReplace) {
    const replacement = await replaceFrameWithComponent(frame, mapping);
    if (replacement === null) {
      console.warn(`Skipped frame "${frame.name}" — component import failed`);
      skipped += 1;
      continue;
    }
    replacements.push({ instance: replacement, mapping });
  }
  emit<MappingsUpdatedEventHandler>(
    MAPPINGS_UPDATED_EVENT,
    handleGetManualMappings()
  );

  updateContainerWrappersToHug(replacements);

  if (replacements.length === 0) {
    figma.notify("No replacements were applied.");
    return;
  }

  const replacementInstances = replacements.map((item) => item.instance);
  figma.currentPage.selection = replacementInstances;
  figma.viewport.scrollAndZoomIntoView(replacementInstances);

  const replacedSuffix = replacements.length === 1 ? "frame" : "frames";
  if (skipped === 0) {
    figma.notify(`Replaced ${replacements.length} ${replacedSuffix}`);
    return;
  }

  const skippedSuffix = skipped === 1 ? "frame" : "frames";
  figma.notify(
    `Replaced ${replacements.length} ${replacedSuffix}, skipped ${skipped} ${skippedSuffix}`
  );
}

/**
 * Collects all frames to replace with their mappings.
 * Priority: manual mappings > name-based matching.
 * Excludes frames that are descendants of other frames to be replaced.
 */
function collectFramesToReplace(): Array<{
  frame: FrameNode;
  mapping: ComponentMapping;
}> {
  const result: Array<{ frame: FrameNode; mapping: ComponentMapping }> = [];
  const processedIds = new Set<string>();

  const manuallyMappedFrames = findManuallyMappedFrames();
  for (const { frame, mapping } of manuallyMappedFrames) {
    processedIds.add(frame.id);
    result.push({ frame, mapping });
  }

  const autoMatchedFrames = findMatchingFrames();
  for (const frame of autoMatchedFrames) {
    if (processedIds.has(frame.id)) {
      continue;
    }
    const matchResult = findMappingForFrame(frame.name);
    if (matchResult !== null) {
      result.push({ frame, mapping: matchResult.mapping });
    }
  }

  const resultIds = new Set(result.map((r) => r.frame.id));
  return result.filter((item) => {
    let current: BaseNode | null = item.frame.parent;
    while (current !== null) {
      if (
        "id" in current &&
        resultIds.has(current.id) &&
        current.id !== item.frame.id
      ) {
        return false;
      }
      current = current.parent;
    }
    return true;
  });
}

/**
 * Finds all frames that have been manually mapped.
 */
function findManuallyMappedFrames(): Array<{
  frame: FrameNode;
  mapping: ComponentMapping;
}> {
  const result: Array<{ frame: FrameNode; mapping: ComponentMapping }> = [];

  pruneInvalidManualMappings();

  manualMappings.forEach((mappingId, nodeId) => {
    const node = figma.getNodeById(nodeId);
    if (node && node.type === "FRAME") {
      const mapping = getMappingById(mappingId);
      if (mapping) {
        result.push({ frame: node as FrameNode, mapping });
      }
    }
  });

  return result;
}

/**
 * Finds all FRAME nodes that match any component mapping.
 * Excludes frames that are descendants of other matching frames to avoid
 * processing children that will be removed when their parent is replaced.
 */
function findMatchingFrames(): FrameNode[] {
  const allMatching = figma.currentPage.findAll((node) => {
    if (node.type !== "FRAME") {
      return false;
    }
    const matchResult = findMappingForFrame(node.name);
    return matchResult !== null;
  }) as FrameNode[];

  // Filter out frames that are descendants of other matching frames
  const matchingSet = new Set(allMatching.map((f) => f.id));

  return allMatching.filter((frame) => {
    // Walk up the tree to check if any ancestor is also in the matching set
    let current: BaseNode | null = frame.parent;
    while (current !== null) {
      if ("id" in current && matchingSet.has(current.id)) {
        // This frame is a descendant of another matching frame - exclude it
        return false;
      }
      current = current.parent;
    }
    return true;
  });
}

/**
 * Replaces a frame with a DS component instance, transferring content.
 */
async function replaceFrameWithComponent(
  frame: FrameNode,
  mapping: ComponentMapping
): Promise<InstanceNode | null> {
  const parent = frame.parent;
  if (parent === null) {
    return null;
  }

  // 1. Extract content from the source frame
  const content = extractFrameContent(frame);

  // 2. Import the DS component
  const node = await getComponentNodeByKey(mapping.componentKey);
  if (node === null) {
    return null;
  }

  // 3. Create an instance (use default variant for component sets)
  const component = node.type === "COMPONENT_SET" ? node.defaultVariant : node;
  if (component === null) {
    console.error("Component set has no default variant");
    return null;
  }

  const instance = component.createInstance();

  // 4. Position the instance where the frame was
  const insertIndex = parent.children.indexOf(frame);
  parent.insertChild(insertIndex + 1, instance);
  applyFrameGeometry(frame, instance);

  // 5. Apply extracted content to the instance
  await applyProperties(instance, content, mapping);
  applyMappedTextProps(instance, frame);

  // 6. Apply instance sizing overrides if specified
  if (mapping.instanceSizing) {
    try {
      if (mapping.instanceSizing.horizontal) {
        instance.layoutSizingHorizontal = mapping.instanceSizing.horizontal;
      }
      if (mapping.instanceSizing.vertical) {
        instance.layoutSizingVertical = mapping.instanceSizing.vertical;
      }
    } catch {
      // May fail depending on parent layout
    }
  }

  // 7. Remove the original frame
  frame.remove();

  return instance;
}

/**
 * Imports a component by key, caching the result.
 * Falls back to finding the component by ID in the current document.
 */
async function getComponentNodeByKey(
  key: string
): Promise<ComponentSetNode | ComponentNode | null> {
  if (componentCache.has(key)) {
    return componentCache.get(key)!;
  }

  // Try importing as regular component first
  try {
    const component = await figma.importComponentByKeyAsync(key);
    componentCache.set(key, component);
    return component;
  } catch {
    // Not a regular component, try as component set
  }

  // Try importing as component set (e.g., components with variants)
  try {
    const componentSet = await figma.importComponentSetByKeyAsync(key);
    componentCache.set(key, componentSet);
    return componentSet;
  } catch {
    // Import by key failed
  }

  // Fallback: find component by its Figma node ID from our component data
  const componentDef = getComponentByKey(key);
  if (componentDef) {
    try {
      const node = figma.getNodeById(componentDef.id);
      if (
        node &&
        (node.type === "COMPONENT" || node.type === "COMPONENT_SET")
      ) {
        componentCache.set(key, node as ComponentNode | ComponentSetNode);
        return node as ComponentNode | ComponentSetNode;
      }
    } catch {
      // Node not found in current document
    }
    figma.notify(
      `⚠️ Could not import "${componentDef.name}" — key may be invalid`,
      { error: true }
    );
  } else {
    figma.notify(`⚠️ Could not import component with key ${key}`, {
      error: true,
    });
  }

  return null;
}

/**
 * Copies geometry/layout properties from source frame to target instance.
 */
function applyFrameGeometry(source: FrameNode, target: InstanceNode) {
  target.x = source.x;
  target.y = source.y;
  target.locked = source.locked;
  target.visible = source.visible;

  // Copy layout constraints if in auto-layout parent
  try {
    target.constraints = { ...source.constraints };
    target.layoutAlign = source.layoutAlign;
    target.layoutGrow = source.layoutGrow;
  } catch {
    // Some properties may not be settable depending on parent
  }
}

/**
 * Finds parent frames named "Container" that directly wrap replaced instances
 * and sets their horizontal and vertical sizing to HUG.
 */
function updateContainerWrappersToHug(
  replacements: Array<{ instance: InstanceNode; mapping: ComponentMapping }>
) {
  const processed = new Set<string>();

  for (const { instance, mapping } of replacements) {
    if (mapping.adjustNamedContainerAncestorsToHug !== true) {
      continue;
    }

    let current: BaseNode | null = instance.parent;
    while (current !== null) {
      if (current.type !== "FRAME") {
        current = current.parent;
        continue;
      }

      if (processed.has(current.id)) {
        current = current.parent;
        continue;
      }

      const name = current.name.toLowerCase();
      if (name !== "container" && name !== "main content") {
        current = current.parent;
        continue;
      }

      try {
        if (current.layoutMode === "NONE") {
          current.layoutMode = "VERTICAL";
        }
        if (current.itemSpacing === 0) {
          current.itemSpacing = 16;
        }
        current.layoutSizingHorizontal = "HUG";
        current.layoutSizingVertical = "HUG";

        for (const child of current.children) {
          if ("layoutAlign" in child) {
            child.layoutAlign = "INHERIT";
          }
          if ("layoutGrow" in child) {
            child.layoutGrow = 0;
          }
        }
      } catch {
        // May fail if the frame doesn't support these properties
      }

      processed.add(current.id);
      current = current.parent;
    }
  }
}

function handleGetSelection(): SelectionInfo | null {
  const selectedNodes = figma.currentPage.selection;
  if (selectedNodes.length === 0) {
    return null;
  }

  return {
    nodes: selectedNodes.map((node) => ({
      nodeId: node.id,
      nodeName: node.name,
      nodeType: node.type,
    })),
  };
}

function handleSelectMappedNode(nodeId: string): void {
  const node = figma.getNodeById(nodeId);
  if (!node || !("type" in node)) {
    figma.notify("Mapped node not found (it may have been deleted).", {
      error: true,
    });
    return;
  }

  figma.currentPage.selection = [node as SceneNode];
  figma.viewport.scrollAndZoomIntoView([node as SceneNode]);
}

function handleMapElements(nodeIds: string[], mappingId: string): void {
  const mapping = getMappingById(mappingId);
  if (!mapping) {
    figma.notify("Invalid mapping selected.", { error: true });
    return;
  }

  if (nodeIds.length === 0) {
    figma.notify("No layers selected.", { error: true });
    return;
  }

  let mappedCount = 0;
  let skippedCount = 0;

  for (const nodeId of nodeIds) {
    const node = figma.getNodeById(nodeId);
    if (!node || node.type !== "FRAME") {
      skippedCount += 1;
      continue;
    }
    manualMappings.set(nodeId, mappingId);
    if (textPropMappings.has(nodeId)) {
      textPropMappings.delete(nodeId);
    }
    mappedCount += 1;
  }

  if (mappedCount === 0) {
    figma.notify("No FRAME layers selected to map.", { error: true });
    return;
  }

  persistManualMappings();
  persistTextPropMappings();
  emit<MappingsUpdatedEventHandler>(
    MAPPINGS_UPDATED_EVENT,
    handleGetManualMappings()
  );

  if (skippedCount > 0) {
    const skippedSuffix = skippedCount === 1 ? "layer" : "layers";
    figma.notify(
      `Mapped ${mappedCount} frame(s), skipped ${skippedCount} ${skippedSuffix}.`
    );
    return;
  }

  figma.notify(`Mapped ${mappedCount} frame(s).`);
}

function handleUnmapElement(nodeId: string): void {
  let changed = false;
  if (manualMappings.delete(nodeId)) {
    changed = true;
  }
  if (textPropMappings.delete(nodeId)) {
    changed = true;
  }
  if (changed) {
    persistManualMappings();
    persistTextPropMappings();
  }
  emit<MappingsUpdatedEventHandler>(
    MAPPINGS_UPDATED_EVENT,
    handleGetManualMappings()
  );
  emit<TextPropMappingsUpdatedEventHandler>(
    TEXT_PROP_MAPPINGS_UPDATED_EVENT,
    nodeId,
    handleGetTextPropMappings(nodeId)
  );
}

function handleGetManualMappings(): ManualMapping[] {
  const pruned = pruneInvalidManualMappings();
  if (pruned) {
    persistManualMappings();
    persistTextPropMappings();
  }

  const result: ManualMapping[] = [];

  manualMappings.forEach((mappingId, nodeId) => {
    const node = figma.getNodeById(nodeId);
    result.push({
      nodeId,
      nodeName: node ? node.name : "(deleted)",
      mappingId,
    });
  });

  return result;
}

async function hydrateManualMappings(): Promise<void> {
  try {
    const stored = (await figma.clientStorage.getAsync(
      MANUAL_MAPPINGS_STORAGE_KEY
    )) as Record<string, string> | null;

    manualMappings.clear();

    if (stored && typeof stored === "object") {
      for (const [nodeId, mappingId] of Object.entries(stored)) {
        if (typeof nodeId !== "string" || typeof mappingId !== "string") {
          continue;
        }
        manualMappings.set(nodeId, mappingId);
      }
    }

    const pruned = pruneInvalidManualMappings();
    if (pruned) {
      persistManualMappings();
      persistTextPropMappings();
    }

    emit<MappingsUpdatedEventHandler>(
      MAPPINGS_UPDATED_EVENT,
      handleGetManualMappings()
    );
  } catch (error) {
    console.error("Failed to load manual mappings from clientStorage:", error);
  }
}

async function hydrateTextPropMappings(): Promise<void> {
  try {
    const stored = (await figma.clientStorage.getAsync(
      TEXT_PROP_MAPPINGS_STORAGE_KEY
    )) as Record<string, Record<string, StoredTextPropBinding>> | null;

    textPropMappings.clear();

    if (stored && typeof stored === "object") {
      for (const [frameId, propMap] of Object.entries(stored)) {
        if (typeof frameId !== "string" || !propMap || typeof propMap !== "object") {
          continue;
        }
        const nextPropMap = new Map<string, StoredTextPropBinding>();
        for (const [propName, binding] of Object.entries(propMap)) {
          if (
            typeof propName !== "string" ||
            !binding ||
            typeof binding !== "object" ||
            typeof binding.sourceNodeId !== "string" ||
            typeof binding.sourceNodeName !== "string" ||
            !Array.isArray(binding.sourcePath)
          ) {
            continue;
          }
          const sourcePath = binding.sourcePath.filter((value) =>
            Number.isInteger(value)
          ) as number[];
          nextPropMap.set(propName, {
            sourceNodeId: binding.sourceNodeId,
            sourceNodeName: binding.sourceNodeName,
            sourcePath,
          });
        }
        if (nextPropMap.size > 0) {
          textPropMappings.set(frameId, nextPropMap);
        }
      }
    }

    const pruned = pruneInvalidTextPropMappings();
    if (pruned) {
      persistTextPropMappings();
    }
  } catch (error) {
    console.error("Failed to load text prop mappings from clientStorage:", error);
  }
}

function persistManualMappings(): void {
  const serializable: Record<string, string> = {};
  manualMappings.forEach((mappingId, nodeId) => {
    serializable[nodeId] = mappingId;
  });

  void figma.clientStorage
    .setAsync(MANUAL_MAPPINGS_STORAGE_KEY, serializable)
    .catch((error) => {
      console.error("Failed to persist manual mappings:", error);
    });
}

function persistTextPropMappings(): void {
  const serializable: Record<string, Record<string, StoredTextPropBinding>> = {};

  textPropMappings.forEach((propMap, frameId) => {
    serializable[frameId] = {};
    propMap.forEach((binding, propName) => {
      serializable[frameId][propName] = binding;
    });
  });

  void figma.clientStorage
    .setAsync(TEXT_PROP_MAPPINGS_STORAGE_KEY, serializable)
    .catch((error) => {
      console.error("Failed to persist text prop mappings:", error);
    });
}

function pruneInvalidManualMappings(): boolean {
  let changed = false;

  manualMappings.forEach((mappingId, nodeId) => {
    const node = figma.getNodeById(nodeId);
    if (!node || node.type !== "FRAME" || !getMappingById(mappingId)) {
      manualMappings.delete(nodeId);
      textPropMappings.delete(nodeId);
      changed = true;
    }
  });

  return changed;
}

function pruneInvalidTextPropMappings(): boolean {
  let changed = false;

  textPropMappings.forEach((propMap, frameId) => {
    const frameNode = figma.getNodeById(frameId);
    const mappingId = manualMappings.get(frameId);
    if (!frameNode || frameNode.type !== "FRAME" || !mappingId) {
      textPropMappings.delete(frameId);
      changed = true;
      return;
    }

    const nextPropMap = new Map<string, StoredTextPropBinding>();
    propMap.forEach((binding, propName) => {
      if (!binding.sourcePath || binding.sourcePath.length === 0) {
        changed = true;
        return;
      }
      nextPropMap.set(propName, binding);
    });

    if (nextPropMap.size === 0) {
      textPropMappings.delete(frameId);
      changed = true;
      return;
    }

    if (nextPropMap.size !== propMap.size) {
      textPropMappings.set(frameId, nextPropMap);
      changed = true;
    }
  });

  return changed;
}

function handleGetTextPropMappings(frameId: string): TextPropMapping[] {
  const pruned = pruneInvalidTextPropMappings();
  if (pruned) {
    persistTextPropMappings();
  }

  const propMap = textPropMappings.get(frameId);
  if (!propMap) {
    return [];
  }

  const result: TextPropMapping[] = [];
  propMap.forEach((binding, propName) => {
    const node = figma.getNodeById(binding.sourceNodeId);
    result.push({
      propName,
      sourceNodeId: binding.sourceNodeId,
      sourceNodeName: node ? node.name : binding.sourceNodeName,
    });
  });
  return result;
}

async function handleMapTextProp(
  frameId: string,
  propName: string,
  sourceNodeId: string
): Promise<void> {
  const frameNode = figma.getNodeById(frameId);
  if (!frameNode || frameNode.type !== "FRAME") {
    figma.notify("Mapped frame not found.", { error: true });
    return;
  }

  const mappingId = manualMappings.get(frameId);
  if (!mappingId) {
    figma.notify("Frame must be manually mapped first.", { error: true });
    return;
  }

  const validProps = new Set(await getLiveTextPropNamesForFrame(frameId));
  if (!validProps.has(propName)) {
    figma.notify("Invalid text property selected.", { error: true });
    return;
  }

  const sourceNode = figma.getNodeById(sourceNodeId);
  if (!sourceNode || sourceNode.type !== "TEXT") {
    figma.notify("Select a TEXT layer as source.", { error: true });
    return;
  }

  const sourcePath = getNodePathFromAncestor(frameNode, sourceNode);
  if (sourcePath === null) {
    figma.notify("Source text must be inside the mapped frame.", {
      error: true,
    });
    return;
  }

  const framePropMap = textPropMappings.get(frameId) ?? new Map();
  framePropMap.set(propName, {
    sourceNodeId,
    sourceNodeName: sourceNode.name,
    sourcePath,
  });
  textPropMappings.set(frameId, framePropMap);
  persistTextPropMappings();

  emit<TextPropMappingsUpdatedEventHandler>(
    TEXT_PROP_MAPPINGS_UPDATED_EVENT,
    frameId,
    handleGetTextPropMappings(frameId)
  );
  figma.notify(`Mapped text prop "${propName}".`);
}

function handleUnmapTextProp(frameId: string, propName: string): void {
  const framePropMap = textPropMappings.get(frameId);
  if (!framePropMap) {
    return;
  }

  if (framePropMap.delete(propName)) {
    if (framePropMap.size === 0) {
      textPropMappings.delete(frameId);
    }
    persistTextPropMappings();
  }

  emit<TextPropMappingsUpdatedEventHandler>(
    TEXT_PROP_MAPPINGS_UPDATED_EVENT,
    frameId,
    handleGetTextPropMappings(frameId)
  );
}

async function getLiveTextPropNamesForFrame(frameId: string): Promise<string[]> {
  const mappingId = manualMappings.get(frameId);
  if (!mappingId) {
    return [];
  }
  const mapping = getMappingById(mappingId);
  if (!mapping) {
    return [];
  }
  return getLiveTextPropNamesForMapping(mappingId, mapping.componentKey);
}

async function getLiveTextPropNamesForMapping(
  mappingId: string,
  componentKey: string
): Promise<string[]> {
  const cached = mappingTextPropNamesCache.get(mappingId);
  if (cached) {
    return cached;
  }

  const node = await getComponentNodeByKey(componentKey);
  if (node === null) {
    return [];
  }

  const component = node.type === "COMPONENT_SET" ? node.defaultVariant : node;
  if (component === null) {
    return [];
  }

  const definitions = component.componentPropertyDefinitions;
  const propNames = Object.entries(definitions)
    .filter(([, def]) => def.type === "TEXT")
    .map(([name]) => name);

  mappingTextPropNamesCache.set(mappingId, propNames);
  return propNames;
}

function applyMappedTextProps(instance: InstanceNode, sourceFrame: FrameNode): void {
  const framePropMap = textPropMappings.get(sourceFrame.id);
  if (!framePropMap || framePropMap.size === 0) {
    return;
  }

  const componentProperties = instance.componentProperties;
  if (!componentProperties) {
    return;
  }

  const properties: Record<string, string> = {};

  framePropMap.forEach((binding, propName) => {
    const prop = componentProperties[propName];
    if (!prop || prop.type !== "TEXT") {
      return;
    }

    const sourceNode = getNodeByPath(sourceFrame, binding.sourcePath);
    if (!sourceNode || sourceNode.type !== "TEXT") {
      return;
    }

    properties[propName] = sourceNode.characters;
  });

  if (Object.keys(properties).length === 0) {
    return;
  }

  try {
    instance.setProperties(properties);
  } catch (error) {
    console.error("Failed to apply mapped text props:", error);
  }
}

function getNodePathFromAncestor(
  ancestor: SceneNode,
  node: SceneNode
): number[] | null {
  const path: number[] = [];
  let current: BaseNode | null = node;

  while (current !== null && "id" in current && current.id !== ancestor.id) {
    const parent: BaseNode | null = current.parent;
    if (!parent || !("children" in parent)) {
      return null;
    }
    const currentId = current.id;
    const children = parent.children as ReadonlyArray<BaseNode>;
    const index = children.findIndex(
      (child) => "id" in child && child.id === currentId
    );
    if (index < 0) {
      return null;
    }
    path.unshift(index);
    current = parent;
  }

  return current && "id" in current && current.id === ancestor.id ? path : null;
}

function getNodeByPath(root: SceneNode, path: number[]): SceneNode | null {
  let current: SceneNode = root;

  for (const index of path) {
    if (!("children" in current)) {
      return null;
    }
    if (index < 0 || index >= current.children.length) {
      return null;
    }
    current = current.children[index] as SceneNode;
  }

  return current;
}
