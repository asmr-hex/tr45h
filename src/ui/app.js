import React from 'react'
import { withTheme, styled } from "@material-ui/core/styles"

import { TransportProvider } from '../context/transport'
import { UIStateProvider } from '../context/ui'
import { AudioProvider } from '../context/audio'
import { AnnotationProvider } from '../context/annotation'

import { Menu } from './menu'
import { Body } from './body'


const AppContainer = withTheme(styled('div')({
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'center',
  height: '100vh',
}))


const App = () => {  
  return (
    <AppContainer>
      <TransportProvider>
        <UIStateProvider>
          <AudioProvider>
            <AnnotationProvider>
              <Menu/>
              <Body/>
            </AnnotationProvider>
          </AudioProvider>
        </UIStateProvider>
      </TransportProvider>
    </AppContainer>
  );
}

export default App;
