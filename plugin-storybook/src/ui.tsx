import {
  Banner,
  Button,
  Container,
  IconWarning16,
  Muted,
  render,
  Text,
  Textbox,
  VerticalSpace
} from '@create-figma-plugin/ui'
import { emit, on } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useCallback, useEffect, useState } from 'preact/hooks'

import {
  CloseHandler,
  GenerateResultHandler,
  GenerateStoryHandler,
  LoadSettingsHandler,
  SaveSettingsHandler,
  SelectionChangeHandler,
  SelectionData
} from './types'

type Status = 'idle' | 'generating' | 'done' | 'error'

function Plugin() {
  const [selection, setSelection] = useState<SelectionData | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [serverUrl, setServerUrl] = useState('http://localhost:3333')
  const [fileKey, setFileKey] = useState('')

  useEffect(() => {
    on<LoadSettingsHandler>('LOAD_SETTINGS', (settings) => {
      setServerUrl(settings.serverUrl)
      setFileKey(settings.fileKey)
    })
    on<SelectionChangeHandler>('SELECTION_CHANGE', (data) => {
      setSelection(data)
      if (status !== 'generating') {
        setStatus('idle')
        setMessage('')
      }
    })
    on<GenerateResultHandler>('GENERATE_RESULT', (result) => {
      if (result.status === 'ok') {
        setStatus('done')
        setMessage(result.message)
      } else {
        setStatus('error')
        setMessage(result.message)
      }
    })
  }, [])

  const handleServerUrlChange = useCallback((value: string) => {
    setServerUrl(value)
    emit<SaveSettingsHandler>('SAVE_SETTINGS', { serverUrl: value, fileKey })
  }, [fileKey])

  const handleFileKeyChange = useCallback((value: string) => {
    setFileKey(value)
    emit<SaveSettingsHandler>('SAVE_SETTINGS', { serverUrl, fileKey: value })
  }, [serverUrl])

  const handleGenerate = useCallback(() => {
    if (!selection) return
    setStatus('generating')
    setMessage('Generating story…')
    emit<GenerateStoryHandler>('GENERATE_STORY', selection)
  }, [selection])

  const handleClose = useCallback(() => {
    emit<CloseHandler>('CLOSE')
  }, [])

  return (
    <Container space="medium">
      <VerticalSpace space="large" />

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

      {status === 'done' && (
        <Banner icon={<IconWarning16 />} variant="success">
          {message}
        </Banner>
      )}
      {status === 'error' && (
        <Banner icon={<IconWarning16 />} variant="warning">
          {message}
        </Banner>
      )}
      {status === 'generating' && (
        <Text>
          <Muted>{message}</Muted>
        </Text>
      )}

      <VerticalSpace space="large" />

      <Button
        fullWidth
        onClick={handleGenerate}
        disabled={!selection || status === 'generating'}
      >
        {status === 'generating' ? 'Generating…' : 'Generate Story'}
      </Button>
      <VerticalSpace space="small" />
      <Button fullWidth onClick={handleClose} secondary>
        Close
      </Button>
      <VerticalSpace space="small" />
    </Container>
  )
}

export default render(Plugin)
