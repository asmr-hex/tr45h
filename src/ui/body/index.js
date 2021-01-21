import React from 'react'
import { withTheme, styled } from "@material-ui/core/styles"

import { MusicEditor } from '../editor/index'


const AppBodyStyled = withTheme(styled('header')({
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'flex-start',
  fontSize: 'calc(10px + 2vmin)',
}))

const FlexibleHalf = withTheme(styled('div')({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  alignItems: 'flex-start',
  border: '1px solid red',
}))

export const Body = props => {
  const isExplorerVisible = true

  return (
    <AppBodyStyled>
      <FlexibleHalf>
        <MusicEditor/>
      </FlexibleHalf>
      {
        isExplorerVisible
          ? <FlexibleHalf>explorer</FlexibleHalf>
          : null
      }
    </AppBodyStyled>
  )
}
