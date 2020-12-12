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
  // play state
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false)

  const context = {
    isAboutDialogOpen,
    setIsAboutDialogOpen,
  }
  
  return (
    <UIStateContext.Provider value={context}>
      {props.children}
    </UIStateContext.Provider>
  )
}
