import React, { createContext, useContext, useEffect, useState } from 'react'

import { useStyles } from './style'
import { useTransport } from './transport'
import { useAudio } from './audio'

import {
  MemorySystem,
  SymbolTable,
  Scheduler,
  Interpreter,
} from '../lang/runtime'


const RuntimeContext = createContext()

export const useRuntime = () => {
  const ctx = useContext(RuntimeContext)
  if (ctx === undefined) {
    throw new Error(`useRuntime must be invoked in a child component of RuntimeProvider`)
  }
  return ctx
}

export const RuntimeProvider = props => {
  const { observable: theme }         = useStyles()
  const { observable: transport }     = useTransport()
  const { audioContext }              = useAudio()
  
  const [memory, setMemory]           = useState(null)
  const [symbols, setSymbols]         = useState(null)
  const [scheduler, setScheduler]     = useState(null)
  const [interpreter, setInterpreter] = useState(null)

  useEffect(() => {
    setMemory(new MemorySystem())
    setSymbols(new SymbolTable({theme}))
  }, [])

  useEffect(() => {
    if (memory === null || symbols === null) return
    setScheduler(new Scheduler({ audioContext, memory, symbols, transport, theme }))
  }, [memory, symbols])

  useEffect(() => {
    if (scheduler === null) return
    setInterpreter(new Interpreter({ memory, symbols, scheduler, transport, theme }))
  }, [scheduler])
  
  const context = {
    memory,
    symbols,
    scheduler,
    interpreter,
  }

  return (
    <RuntimeContext.Provider value={context}>
      { interpreter === null ? null : props.children }
    </RuntimeContext.Provider>
  )
}
