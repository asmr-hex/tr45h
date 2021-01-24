import React, { createContext, useContext, useState, useEffect } from 'react'


const DictionaryContext = createContext()

export const useDictionaryContext = () => {
  const ctx = useContext(DictionaryContext)
  if (ctx === undefined) {
    throw new Error(`DictionaryContext must be invoked in a child component of DictionaryProvider`)
  }
  return ctx
}


export const DictionaryProvider = props => {
  const [symbols, setSymbolTable] = useState(null)

  const context = {
    symbols,
    setSymbolTable,
  }
  
  return (
    <DictionaryContext.Provider value={context}>
      {props.children}
    </DictionaryContext.Provider>
  )
}
