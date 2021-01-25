import React, { createContext, useContext, useState, useEffect } from 'react'

import { Dictionary } from '../dictionary'


const DictionaryContext = createContext()

export const useDictionaryContext = () => {
  const ctx = useContext(DictionaryContext)
  if (ctx === undefined) {
    throw new Error(`DictionaryContext must be invoked in a child component of DictionaryProvider`)
  }
  return ctx
}


export const DictionaryProvider = props => {
  const [dictionary, setDictionary] = useState(new Dictionary())

  const context = {
    dictionary
  }
  
  return (
    <DictionaryContext.Provider value={context}>
      {props.children}
    </DictionaryContext.Provider>
  )
}
