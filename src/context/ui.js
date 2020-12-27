import React, { createContext, useContext, useState } from 'react'


const UIStateContext = createContext()

export const useUIStateContext = () => {
  const ctx = useContext(UIStateContext)
  if (ctx === undefined) {
    throw new Error(`useUIStateContext must be invoked in a child component of UIStateProvider`)
  }
  return ctx
}


export const UIStateProvider = props => {
  // UI states
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false)
  const [isCLIOpen, setIsCLIOpen] = useState(false)

  const context = {
    isAboutDialogOpen,
    setIsAboutDialogOpen,

    isCLIOpen,
    openCLI: () => setIsCLIOpen(true),
    closeCLI: () => setIsCLIOpen(false),
  }
  
  return (
    <UIStateContext.Provider value={context}>
      {props.children}
    </UIStateContext.Provider>
  )
}
