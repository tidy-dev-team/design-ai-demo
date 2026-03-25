// ============================================
// Component Data Types (from componentData.json)
// ============================================

export interface ComponentDataFile {
  $schema: string;
  version: string;
  generatedAt: string;
  source: {
    fileKey: string;
    fileName: string;
  };
  components: ComponentDefinition[];
}

export interface ComponentDefinition {
  name: string;
  key: string;
  type: "component" | "componentSet";
  id: string;
  description?: string;
  documentationLinks?: string[];
  path: string[];
  anatomy: AnatomyNode;
  props: PropDefinition[];
  defaultStyles: Record<string, unknown>;
}

export interface AnatomyNode {
  name: string;
  type: "root" | "container" | "text" | "vector" | "slot";
  figmaType?: string;
  children?: AnatomyNode[];
}

export interface PropDefinition {
  name: string;
  type: "enum" | "boolean" | "string" | "slot";
  figmaType: "VARIANT" | "BOOLEAN" | "TEXT" | "INSTANCE_SWAP";
  default?: string | boolean;
  options?: string[];
}

// ============================================
// Property Mappings Types (from propertyMappings.json)
// ============================================

export interface PropertyMappingsFile {
  $schema: string;
  version: string;
  mappings: Record<string, ComponentMapping>;
}

export interface ComponentMapping {
  componentKey: string;
  frameMatcher: FrameMatcher;
  properties: PropertyMappingRule[];
  adjustNamedContainerAncestorsToHug?: boolean;
  instanceSizing?: {
    horizontal?: "HUG" | "FILL" | "FIXED";
    vertical?: "HUG" | "FILL" | "FIXED";
  };
}

export interface FrameMatcher {
  type: "nameContains" | "nameEquals" | "nameStartsWith" | "nameFuzzy";
  value: string;
}

export interface PropertyMappingRule {
  target: string;
  source: SourceExtractor;
}

export type SourceExtractor =
  | { type: "text" }
  | { type: "hasLeftIcon" }
  | { type: "hasRightIcon" }
  | { type: "leftIconInstance" }
  | { type: "rightIconInstance" }
  | { type: "static"; value: string | boolean }
  | { type: "textFromFrame"; frameName: string };

// ============================================
// Extracted Content (runtime)
// ============================================

export interface ExtractedContent {
  text: string | null;
  hasLeftIcon: boolean;
  hasRightIcon: boolean;
  leftIconKey: string | null;
  rightIconKey: string | null;
  /** Texts keyed by lowercased frame/group name, for targeted extraction. */
  namedFrameTexts: Record<string, string>;
}

// ============================================
// Legacy Types (for backward compatibility)
// ============================================

export interface ComponentRegistry {
  [key: string]: ComponentInfo;
}

export interface ComponentInfo {
  key: string;
  name: string;
  type?: string;
}

// ============================================
// Selection & Manual Mapping Types
// ============================================

export interface SelectionNodeInfo {
  nodeId: string;
  nodeName: string;
  nodeType: string;
}

export interface SelectionInfo {
  nodes: SelectionNodeInfo[];
}

export interface ManualMapping {
  nodeId: string;
  nodeName: string;
  mappingId: string;
}

export interface TextPropMapping {
  propName: string;
  sourceNodeId: string;
  sourceNodeName: string;
}

// ============================================
// Event Types
// ============================================

export const FIND_COMPONENTS_EVENT = "FIND_COMPONENTS" as const;
export const REPLACE_COMPONENTS_EVENT = "REPLACE_COMPONENTS" as const;
export const GET_SELECTION_EVENT = "GET_SELECTION" as const;
export const MAP_ELEMENTS_EVENT = "MAP_ELEMENTS" as const;
export const UNMAP_ELEMENT_EVENT = "UNMAP_ELEMENT" as const;
export const GET_MANUAL_MAPPINGS_EVENT = "GET_MANUAL_MAPPINGS" as const;
export const GET_TEXT_PROP_MAPPINGS_EVENT = "GET_TEXT_PROP_MAPPINGS" as const;
export const GET_TEXT_PROP_DEFINITIONS_EVENT =
  "GET_TEXT_PROP_DEFINITIONS" as const;
export const MAP_TEXT_PROP_EVENT = "MAP_TEXT_PROP" as const;
export const UNMAP_TEXT_PROP_EVENT = "UNMAP_TEXT_PROP" as const;
export const SELECTION_CHANGED_EVENT = "SELECTION_CHANGED" as const;
export const MAPPINGS_UPDATED_EVENT = "MAPPINGS_UPDATED" as const;
export const TEXT_PROP_MAPPINGS_UPDATED_EVENT =
  "TEXT_PROP_MAPPINGS_UPDATED" as const;
export const TEXT_PROP_DEFINITIONS_UPDATED_EVENT =
  "TEXT_PROP_DEFINITIONS_UPDATED" as const;
export const SELECT_MAPPED_NODE_EVENT = "SELECT_MAPPED_NODE" as const;

export type PluginEvent =
  | typeof FIND_COMPONENTS_EVENT
  | typeof REPLACE_COMPONENTS_EVENT
  | typeof GET_SELECTION_EVENT
  | typeof MAP_ELEMENTS_EVENT
  | typeof UNMAP_ELEMENT_EVENT
  | typeof GET_MANUAL_MAPPINGS_EVENT
  | typeof GET_TEXT_PROP_MAPPINGS_EVENT
  | typeof GET_TEXT_PROP_DEFINITIONS_EVENT
  | typeof MAP_TEXT_PROP_EVENT
  | typeof UNMAP_TEXT_PROP_EVENT
  | typeof SELECTION_CHANGED_EVENT
  | typeof MAPPINGS_UPDATED_EVENT
  | typeof TEXT_PROP_MAPPINGS_UPDATED_EVENT
  | typeof TEXT_PROP_DEFINITIONS_UPDATED_EVENT
  | typeof SELECT_MAPPED_NODE_EVENT;

export type FindComponentsEventHandler = {
  name: typeof FIND_COMPONENTS_EVENT;
  handler: () => void | Promise<void>;
};

export type ReplaceComponentsEventHandler = {
  name: typeof REPLACE_COMPONENTS_EVENT;
  handler: () => void | Promise<void>;
};

export type GetSelectionEventHandler = {
  name: typeof GET_SELECTION_EVENT;
  handler: () => SelectionInfo | null;
};

export type MapElementsEventHandler = {
  name: typeof MAP_ELEMENTS_EVENT;
  handler: (nodeIds: string[], mappingId: string) => void;
};

export type UnmapElementEventHandler = {
  name: typeof UNMAP_ELEMENT_EVENT;
  handler: (nodeId: string) => void;
};

export type GetManualMappingsEventHandler = {
  name: typeof GET_MANUAL_MAPPINGS_EVENT;
  handler: () => ManualMapping[];
};

export type GetTextPropMappingsEventHandler = {
  name: typeof GET_TEXT_PROP_MAPPINGS_EVENT;
  handler: (frameId: string) => TextPropMapping[];
};

export type GetTextPropDefinitionsEventHandler = {
  name: typeof GET_TEXT_PROP_DEFINITIONS_EVENT;
  handler: (frameId: string) => Promise<string[]> | string[];
};

export type MapTextPropEventHandler = {
  name: typeof MAP_TEXT_PROP_EVENT;
  handler: (
    frameId: string,
    propName: string,
    sourceNodeId: string
  ) => Promise<void> | void;
};

export type UnmapTextPropEventHandler = {
  name: typeof UNMAP_TEXT_PROP_EVENT;
  handler: (frameId: string, propName: string) => void;
};

export type SelectionChangedEventHandler = {
  name: typeof SELECTION_CHANGED_EVENT;
  handler: (selection: SelectionInfo | null) => void;
};

export type MappingsUpdatedEventHandler = {
  name: typeof MAPPINGS_UPDATED_EVENT;
  handler: (mappings: ManualMapping[]) => void;
};

export type TextPropMappingsUpdatedEventHandler = {
  name: typeof TEXT_PROP_MAPPINGS_UPDATED_EVENT;
  handler: (frameId: string, mappings: TextPropMapping[]) => void;
};

export type TextPropDefinitionsUpdatedEventHandler = {
  name: typeof TEXT_PROP_DEFINITIONS_UPDATED_EVENT;
  handler: (frameId: string, propNames: string[]) => void;
};

export type SelectMappedNodeEventHandler = {
  name: typeof SELECT_MAPPED_NODE_EVENT;
  handler: (nodeId: string) => void;
};

// ============================================
// Storybook Feature Types
// ============================================

export interface StorybookSelectionData {
  figmaUrl: string;
  nodeId: string;
  componentName: string;
}

export const STORYBOOK_GENERATE_STORY = "STORYBOOK_GENERATE_STORY" as const;
export const STORYBOOK_GENERATE_RESULT = "STORYBOOK_GENERATE_RESULT" as const;
export const STORYBOOK_SELECTION_CHANGE = "STORYBOOK_SELECTION_CHANGE" as const;
export const STORYBOOK_OPEN = "STORYBOOK_OPEN" as const;
export const STORYBOOK_OPEN_RESULT = "STORYBOOK_OPEN_RESULT" as const;
export const RESIZE_UI_EVENT = "RESIZE_UI" as const;

export type StorybookGenerateStoryHandler = {
  name: typeof STORYBOOK_GENERATE_STORY;
  handler: (data: StorybookSelectionData) => void;
};

export type StorybookGenerateResultHandler = {
  name: typeof STORYBOOK_GENERATE_RESULT;
  handler: (result: { status: "ok" | "error"; message: string }) => void;
};

export type StorybookSelectionChangeHandler = {
  name: typeof STORYBOOK_SELECTION_CHANGE;
  handler: (data: StorybookSelectionData | null) => void;
};

export type StorybookOpenHandler = {
  name: typeof STORYBOOK_OPEN;
  handler: () => void;
};

export type StorybookOpenResultHandler = {
  name: typeof STORYBOOK_OPEN_RESULT;
  handler: (result: { status: "ok" | "error"; url?: string; message?: string }) => void;
};

export type ResizeUiHandler = {
  name: typeof RESIZE_UI_EVENT;
  handler: (tab: string) => void;
};
