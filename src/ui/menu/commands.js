import React, { useEffect, useState } from 'react'
import { withTheme, styled } from '@material-ui/core/styles'

import { CLI } from '../cli/index-new'


const CommandInterfaceRoot = withTheme(styled('div')({
  display: 'flex',
  flexGrow: 1,
  // flexDirection: 'column',
  // alignItems: 'flex-start',
  position: 'relative',
  backgroundColor: 'violet'
}))

const CommandInterface = withTheme(styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: '100%',
  position: 'absolute',
  backgroundColor: 'grey',
}))

const CommandLine = withTheme(styled('div')({
  
}))

const Suggestions = withTheme(styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: '100%',
  backgroundColor: 'blue',
}))

const Suggestion = withTheme(styled('div')({
  backgroundColor: 'green',
}))

export const Commands = props => {
  const [suggestions, setSuggestions] = useState([])

  return (
    <CommandInterfaceRoot>
      <CommandInterface>
        <CommandLine>
          <CLI setSuggestions={setSuggestions} />
        </CommandLine>
        <Suggestions>
          { suggestions.map((s, i) => <Suggestion key={i}>{s}</Suggestion>) }
        </Suggestions>
      </CommandInterface>
    </CommandInterfaceRoot>
  )
}
