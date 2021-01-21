import React from 'react'
import {
  withTheme,
  styled
} from "@material-ui/core/styles"

import { TransportProvider } from '../context/transport'
import { UIStateProvider } from '../context/ui'
import { AnnotationProvider } from '../context/annotation'

import { Menu } from './menu'
import { Body } from './body'


const AppContainer = withTheme(styled('div')({
  textAlign: 'center',
}))


const App = () => {  
  return (
    <AppContainer>
      <TransportProvider>
        <UIStateProvider>
          <AnnotationProvider>
            <Menu/>
            <Body/>
          </AnnotationProvider>
        </UIStateProvider>
      </TransportProvider>
    </AppContainer>
  );
}

export default App;
