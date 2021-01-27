import React, { createContext, useContext, useState, useEffect } from 'react'

import { useRuntime } from './runtime'

import { SemanticTokenType } from '../lang/types'

import { Dictionary } from '../ui/lib/editor/dictionary'


const DictionaryContext = createContext()

export const useDictionary = () => {
  const ctx = useContext(DictionaryContext)
  if (ctx === undefined) {
    throw new Error(`useDictionary must be invoked in a child component of DictionaryProvider`)
  }
  return ctx
}


export const DictionaryProvider = props => {
  const { symbols } = useRuntime()
  const [dictionary, setDictionary] = useState(new Dictionary())

  useEffect(() => {
    // create new contexts in the dictionary for stuff
    dictionary.new('symbols.sounds')
    dictionary.new('symbols.variables')
    dictionary.new('symbols.functions')

    
    // TODO subscribe dictionary to updates from runtime.
    symbols.updates.subscribe(s => {  // TODO rewrite with RxJs filtering and stuff.
      if (s === null) return
      if (s.type !== SemanticTokenType.SoundLiteral) return
      dictionary.add('symbols.sounds', [s.keyword])
    })

    // TODO add more subscriptions.....
  }, [])
  
  const context = {
    dictionary
  }
  
  return (
    <DictionaryContext.Provider value={context}>
      {props.children}
    </DictionaryContext.Provider>
  )
}