import React from 'react'
import {
  withTheme,
  styled
} from "@material-ui/core/styles"

import { TransportProvider } from '../context/transport'
import { UIStateProvider } from '../context/ui'

import { MusicEditor } from './editor/index'
import { Toolbar } from  './toolbar'
import { Details } from './statbar'
import { AboutDialog } from  './toolbar/dialog/about'


const AppContainer = withTheme(styled('div')({
  textAlign: 'center',
}))

const AppBody = withTheme(styled('header')({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  fontSize: 'calc(10px + 2vmin)',
  paddingTop: '100px',
}))


const App = () => {  
  return (
    <AppContainer>
      <TransportProvider>
        <UIStateProvider>
          <Toolbar/>
          <AppBody>
            <div style={{display: 'flex', flexDirection: 'row', height: '100%', width: '100%', justifyContent: 'center'}}>
              <MusicEditor/>
            </div>
            <AboutDialog/>
          </AppBody>
          <Details/>
        </UIStateProvider>
      </TransportProvider>
    </AppContainer>
  );
}

export default App;
