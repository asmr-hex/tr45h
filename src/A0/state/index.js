import React from 'react'

import { StyleProvider } from './style'
import { AudioProvider } from './audio'
import { CLIProvider } from './cli'
import { TransportProvider } from './transport'
import { UIStateProvider } from './ui'
import { RuntimeProvider } from './runtime'
import { DictionaryProvider } from './dictionary'
import { AnnotationProvider } from './annotation'


export { StyleProvider, useStyles } from './style'
export { AudioProvider, useAudio } from './audio'
export { CLIProvider, useCLI } from './cli'
export { TransportProvider, useTransport } from './transport'
export { UIStateProvider, useUIState } from './ui'
export { RuntimeProvider, useRuntime } from './runtime'
export { DictionaryProvider, useDictionary } from './dictionary'
export { AnnotationProvider, useAnnotations } from './annotation'

export const GlobalStateProvider = props => (
  <StyleProvider>
    <AudioProvider>
      <TransportProvider>
        <UIStateProvider>
          <RuntimeProvider>
            <CLIProvider>
              <DictionaryProvider>
                <AnnotationProvider>

                  {props.children}
                </AnnotationProvider>
              </DictionaryProvider>
            </CLIProvider>
          </RuntimeProvider>
        </UIStateProvider>
      </TransportProvider>
    </AudioProvider>
  </StyleProvider>
)
