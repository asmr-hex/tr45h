import React, { createContext, useContext, useState } from 'react'


const UIStateContext = createContext()

export const useUIState = () => {
  const ctx = useContext(UIStateContext)
  if (ctx === undefined) {
    throw new Error(`useUIState must be invoked in a child component of UIStateProvider`)
  }
  return ctx
}

export const UIStateProvider = props => {
  const [isEditorFocused, setIsEditorFocused]     = useState(true)
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false)
  const [isCliFocused, setIsCliFocused]           = useState(false)
  const [isExplorerOpen, setIsExplorerOpen]       = useState(false)
  const [explorerContent, setExplorerContent]     = useState(null)

  const context = {
    isEditorFocused,
    
    isAboutDialogOpen,
    setIsAboutDialogOpen,

    isCliFocused,
    focusCLI: () => {
      setIsCliFocused(true)
      setIsEditorFocused(false)
    },
    blurCLI: () => {
      setIsCliFocused(false)
      setIsEditorFocused(true)
    },

    isExplorerOpen,
    explorerContent,
    openExplorer: component => {
      setIsExplorerOpen(true)
      setExplorerContent(component)
    },
    closeExplorer: () => {
      setIsExplorerOpen(false)
      setExplorerContent(null)
    },
  }
  
  return (
    <UIStateContext.Provider value={context}>
      {props.children}
    </UIStateContext.Provider>
  )
}
