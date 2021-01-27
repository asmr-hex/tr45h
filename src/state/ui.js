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
  // UI states
  const [isEditorOpen, setIsEditorOpen] = useState(true)  // TODO rename to isEditorFocused
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false)
  const [isCLIOpen, setIsCLIOpen] = useState(false)
  const [isCliFocused, setIsCliFocused] = useState(false)
  const [isExplorerOpen, setIsExplorerOpen] = useState(false)
  const [explorerContent, setExplorerContent] = useState(null)

  const context = {
    isEditorOpen,
    
    isAboutDialogOpen,
    setIsAboutDialogOpen,

    isCLIOpen,
    openCLI: () => {
      setIsCLIOpen(true)
      setIsEditorOpen(false)
    },
    closeCLI: () => {
      setIsCLIOpen(false)
      setIsEditorOpen(true)
    },

    isCliFocused,
    focusCLI: () => {
      setIsCliFocused(true)
      setIsEditorOpen(false)
    },
    blurCLI: () => {
      setIsCliFocused(false)
      setIsEditorOpen(true)
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
