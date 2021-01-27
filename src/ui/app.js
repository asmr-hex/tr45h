import React from 'react'
import { withTheme, styled } from "@material-ui/core/styles"

import { GlobalStateProvider } from '../state'

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
      <GlobalStateProvider>
        <Menu/>
        <Body/>
      </GlobalStateProvider>
    </AppContainer>
  );
}

export default App;
