import { EventHandler } from '@create-figma-plugin/utilities'

export interface Settings {
  serverUrl: string
  fileKey: string
}

export interface SelectionData {
  figmaUrl: string
  nodeId: string
  componentName: string
}

export interface SelectionChangeHandler extends EventHandler {
  name: 'SELECTION_CHANGE'
  handler: (data: SelectionData | null) => void
}

export interface GenerateStoryHandler extends EventHandler {
  name: 'GENERATE_STORY'
  handler: (data: SelectionData) => void
}

export interface GenerateResultHandler extends EventHandler {
  name: 'GENERATE_RESULT'
  handler: (result: { status: 'ok' | 'error'; message: string }) => void
}

export interface LoadSettingsHandler extends EventHandler {
  name: 'LOAD_SETTINGS'
  handler: (settings: Settings) => void
}

export interface SaveSettingsHandler extends EventHandler {
  name: 'SAVE_SETTINGS'
  handler: (settings: Settings) => void
}

export interface CloseHandler extends EventHandler {
  name: 'CLOSE'
  handler: () => void
}
