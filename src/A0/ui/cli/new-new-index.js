import React, { useEffect, useState, useRef } from 'react'

import { Editor } from 'A0/ui/lib/editor'
import { isSuggestionEntity, getSuggestionEntityType } from 'A0/ui/lib/editor/autosuggest'

import {
  useCLI,
  useStyles,
  useRuntime,
  useUIState,
  useDictionary,
  useAnnotations,
} from 'A0/state'

import { KeyBindingFn, KeyBoundAction } from './keybinding'


export const CLI = props => {
  const { setSuggestions } = props
  const { theme } = useStyles()
  const { cli }   = useCLI()
  const { dictionary } = useDictionary()
  const {
    blurCLI,
    isCliFocused,
  } = useUIState()

  const editorRef = useRef(null)

  useEffect(() => { if (isCliFocused) editorRef.current.focus() }, [isCliFocused])

  
  const interpret = (block, index, text) => cli.interpret(text)
  const getTokenStyles = (key, token) => {
    const isSuggestion = isSuggestionEntity(token.type)

    if (isSuggestion) console.log(token)
    return {
      classes: [
        isSuggestion ? theme.classes.cli[getSuggestionEntityType(token.type)] : ''
      ],
      styles: {}
    }
  }
  const onChange = n => n
  const handleClose = () => blurCLI()

  const handleKeyCommand = command => {
    switch (command) {
    case KeyBoundAction.CloseCLI:
      handleClose()
      return 'handled'
    case KeyBoundAction.ExecuteCommand:
      cli.execute()
      handleClose()
      return 'handled'
    default:
      return 'not-handled'
    }
  }
  
  return (
    <Editor
      ref={editorRef}
      interpret={interpret}
      getTokenStyles={getTokenStyles}
      dictionary={dictionary}
      setSuggestions={setSuggestions}
      inlineSuggestions={false}
      matchEntireLine={true}
      defaultSuggestions={['cli.commands', 'symbols.sounds']}
      onChange={onChange}
      handleKeyCommand={handleKeyCommand}
      keyBindingFn={KeyBindingFn}
    />
  )
}
