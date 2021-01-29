import React, { useEffect, useState, useRef } from 'react'

import { Editor } from 'A0/ui/lib/editor'

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
  const getTokenStyles = () => ({})
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
    // case KeyBoundAction.CycleSuggestions:
    //   setEditorState(autosuggest.cycleSuggestions(editorState))
    //   return 'handled'
    // case KeyBoundAction.AutoComplete:
    //   setEditorState(autosuggest.complete(editorState))
    //   return 'handled'
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
      onChange={onChange}
      handleKeyCommand={handleKeyCommand}
      keyBindingFn={KeyBindingFn}
    />
  )
}
