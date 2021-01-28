import React from 'react'
import { withTheme, styled } from "@material-ui/core/styles"

import { GlobalStateProvider } from 'A0/state'

import { Menu } from 'A0/ui/menu'
import { Body } from 'A0/ui/body'


const AppContainer = withTheme(styled('div')({
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'center',
  height: '100vh',
}))


export const App = () => {  
  return (
    <AppContainer>
      <GlobalStateProvider>
        <Menu/>
        <Body/>
      </GlobalStateProvider>
    </AppContainer>
  )
}
