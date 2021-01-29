import React, { useEffect, useState } from 'react'
import { withTheme, styled } from '@material-ui/core/styles'

import { CLI } from '../cli/new-new-index'


const CommandInterfaceRoot = withTheme(styled('div')({
  display: 'flex',
  width: '85%',
  // flexDirection: 'column',
  // alignItems: 'flex-start',
  position: 'relative',
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
  width: '100%',
  overflow: 'hidden',
  overflowX: 'scroll',
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
