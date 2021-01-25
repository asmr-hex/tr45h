import React from 'react'
import { withTheme, styled } from "@material-ui/core/styles"

import { useUIStateContext } from '../../context/ui'

import { Editor } from '../../editor'
import { MusicEditor } from '../editor/index'
import { Explorer } from '../explorer'


const AppBodyStyled = withTheme(styled('div')({
  height: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  fontSize: 'calc(4px + 2vmin)',
  overflow: 'hidden',
}))

const FlexibleHalf = withTheme(styled('div')({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
}))

export const Body = props => {
  const {
    isExplorerOpen,
    closeExplorer,
    explorerContent,
  } = useUIStateContext()

  return (
    <AppBodyStyled>
      <FlexibleHalf>
        <Editor/>
      </FlexibleHalf>
      {
        isExplorerOpen
          ? <FlexibleHalf sticky><Explorer close={closeExplorer} content={explorerContent}/></FlexibleHalf>
          : null
      }
    </AppBodyStyled>
  )
}
