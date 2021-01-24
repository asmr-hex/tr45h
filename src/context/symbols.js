import React, { createContext, useContext, useState, useEffect } from 'react'


const SymbolContext = createContext()

export const useSymbolContext = () => {
  const ctx = useContext(SymbolContext)
  if (ctx === undefined) {
    throw new Error(`SymbolContext must be invoked in a child component of SymbolProvider`)
  }
  return ctx
}


export const SymbolProvider = props => {
  const [symbols, setSymbolTable] = useState(null)

  const context = {
    symbols,
    setSymbolTable,
  }
  
  return (
    <SymbolContext.Provider value={context}>
      {props.children}
    </SymbolContext.Provider>
  )
}
