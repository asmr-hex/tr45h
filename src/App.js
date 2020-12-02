import React from 'react'
import {
  makeStyles,
  withTheme,
  styled
} from "@material-ui/core/styles"

import { TransportProvider } from './context/transport'
import { SequenceProvider } from './context/sequence'

import { MusicEditor } from './editor/index'
import { Toolbar } from  './toolbar'


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
        <Toolbar/>
        <AppBody>
          <div style={{display: 'flex', flexDirection: 'row', height: '100%', width: '100%', justifyContent: 'center'}}>
            <MusicEditor/>
          </div>
        </AppBody>
      </TransportProvider>
    </AppContainer>
  );
}

export default App;
