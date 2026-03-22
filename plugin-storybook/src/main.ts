import { emit, on, showUI } from '@create-figma-plugin/utilities'

import {
  CloseHandler,
  GenerateStoryHandler,
  GenerateResultHandler,
  LoadSettingsHandler,
  SaveSettingsHandler,
  SelectionChangeHandler,
  SelectionData,
  Settings
} from './types'

const VALID_TYPES: string[] = ['COMPONENT', 'COMPONENT_SET', 'INSTANCE', 'FRAME', 'SECTION']

let savedFileKey = ''

function getSelectionData(): SelectionData | null {
  const sel = figma.currentPage.selection[0]
  if (!sel) return null

  if (!VALID_TYPES.includes(sel.type)) return null

  const nodeId = sel.id
  const fileKey = figma.fileKey || savedFileKey || 'UNKNOWN'
  const figmaUrl = `https://www.figma.com/design/${fileKey}/file?node-id=${nodeId.replace(':', '-')}`

  // For instances, resolve to the main component name
  // For frames/sections, use the frame name directly (layout mode)
  let raw = sel.name
  if (sel.type === 'INSTANCE') {
    const main = (sel as InstanceNode).mainComponent
    if (main) raw = main.parent?.type === 'COMPONENT_SET'
      ? main.parent.name
      : main.name
  } else if (sel.type === 'COMPONENT') {
    const parent = sel.parent
    if (parent && parent.type === 'COMPONENT_SET') {
      raw = parent.name
    }
  }

  const componentName = raw
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')

  return { figmaUrl, nodeId, componentName }
}

function sendSelection() {
  emit<SelectionChangeHandler>('SELECTION_CHANGE', getSelectionData())
}

export default function () {
  // Save settings from UI
  on<SaveSettingsHandler>('SAVE_SETTINGS', async function (settings: Settings) {
    await figma.clientStorage.setAsync('serverUrl', settings.serverUrl)
    await figma.clientStorage.setAsync('fileKey', settings.fileKey)
    savedFileKey = settings.fileKey
    // Re-send selection with updated fileKey
    sendSelection()
  })

  // Handle generate request from UI
  on<GenerateStoryHandler>('GENERATE_STORY', async function (data) {
    try {
      const serverUrl =
        (await figma.clientStorage.getAsync('serverUrl')) ||
        'http://localhost:3333'

      const resp = await fetch(`${serverUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const json = await resp.json()

      if (json.status === 'ok') {
        emit<GenerateResultHandler>('GENERATE_RESULT', {
          status: 'ok',
          message: `${json.file} created`
        })
      } else {
        emit<GenerateResultHandler>('GENERATE_RESULT', {
          status: 'error',
          message: json.message || 'Server returned an error'
        })
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Could not reach server'
      emit<GenerateResultHandler>('GENERATE_RESULT', {
        status: 'error',
        message: `Local server not running. Start it with \`npm run dev\`. (${message})`
      })
    }
  })

  on<CloseHandler>('CLOSE', function () {
    figma.closePlugin()
  })

  showUI({
    height: 320,
    width: 320
  })

  // Load saved settings and send to UI
  Promise.all([
    figma.clientStorage.getAsync('serverUrl'),
    figma.clientStorage.getAsync('fileKey')
  ]).then(([serverUrl, fileKey]) => {
    savedFileKey = fileKey || ''
    emit<LoadSettingsHandler>('LOAD_SETTINGS', {
      serverUrl: serverUrl || 'http://localhost:3333',
      fileKey: fileKey || ''
    })
    sendSelection()
  })

  // Update UI when selection changes
  figma.on('selectionchange', sendSelection)
}
