import React, { useState, forwardRef } from 'react'
import { Editor as DraftEditor, EditorState } from 'draft-js'
import 'draft-js/dist/Draft.css'

import { Dictionary } from './dictionary'
import { Decorator } from './decorator'
import { KeyBindingFn, KeyBoundAction } from './keybindings'


export const Editor = forwardRef((props, ref) => {
  const {
    contentState      = null,
    interpret         = (blockKey, blockIndex, blockText) => [],
    getTokenStyles    = (key, token) => ({}),
    dictionary        = new Dictionary(),
    setSuggestions    = suggestions => {},
    inlineSuggestions = true,
    suggestOnEmpty    = false,
    onChange          = newEditorState => newEditorState,
    handleKeyCommand  = cmd => 'not-handled',
    keyBindingFn      = e => null,
    ...otherProps
  } = props

  const createDecorator = () => new Decorator(
    interpret,
    getTokenStyles,
    dictionary,
    setSuggestions,
    inlineSuggestions,
    suggestOnEmpty,
  )
  
  // setup editor state
  const [editorState, setEditorState] = useState(
    () => contentState
      ? EditorState.createWithContent(contentState, createDecorator())
      : EditorState.createEmpty(createDecorator())
  )

  const _onChange = newEditorState => {
    const decorator = newEditorState.getDecorator()
    
    // prevent changes until decorator has been set
    if (decorator === null) return

    setEditorState(decorator.suggest(onChange(newEditorState)))
  }

  const _handleKeyCommand = command => {
    if (handleKeyCommand(command) === 'handled') return 'handled'
    
    switch(command) {
    case KeyBoundAction.CycleSuggestions:
      setEditorState(editorState.getDecorator().autosuggest.cycle(editorState))
      return 'handled'
    case KeyBoundAction.AutoComplete:
      setEditorState(editorState.getDecorator().autosuggest.complete(editorState))
      return 'handled'
    default:
      return 'not-handled'
    }
  }
  
  return (
    <DraftEditor
      ref={ref}
      editorState={editorState}
      onChange={_onChange}
      handleKeyCommand={_handleKeyCommand}
      keyBindingFn={KeyBindingFn(keyBindingFn)}
      {...otherProps}
    />
  )
})
