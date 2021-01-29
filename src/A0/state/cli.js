import React, { createContext, useContext, useEffect, useState } from 'react'

import {
  useStyles,
  useUIState,
  useRuntime,
  useTransport,
} from 'A0/state'

import { CLI as CommandLineInterface } from 'A0/cli'


const CLIContext = createContext()

export const useCLI = () => {
  const ctx = useContext(CLIContext)
  if (ctx === undefined) {
    throw new Error(`useCLI must be invoked in a child component of CLIProvider`)
  }
  return ctx
}

export const CLIProvider = props => {
  const { observable:  theme }        = useStyles()
  const { observables: transport }    = useTransport()
  const { openExplorer } = useUIState()
  const { symbols } = useRuntime()
  
  const [cli, setCli]           = useState(new CommandLineInterface({ symbols, actions: { openExplorer }}))

  const context = {
    cli,
  }

  return (
    <CLIContext.Provider value={context}>
      { cli === null ? null : props.children }
    </CLIContext.Provider>
  )
}
