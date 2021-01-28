import React, { useState } from 'react'
import { Editor as DraftEditor, EditorState } from 'draft-js'
import 'draft-js/dist/Draft.css'

import { Dictionary } from './dictionary'
import { Decorator } from './decorator'


export const Editor = props => {
  const {
    contentState   = null,
    interpret      = (blockKey, blockIndex, blockText) => [],
    getTokenStyles = (key, token) => ({}),
    dictionary     = new Dictionary(),
    setSuggestions = suggestions => {},
    triggerSuggest = () => {},
    onChange       = newEditorState => newEditorState,
    ...otherProps
  } = props

  const createDecorator = () => new Decorator(
    interpret,
    getTokenStyles,
    dictionary,
    setSuggestions,
    triggerSuggest,
  )
  
  // setup editor state
  const [editorState, setEditorState] = useState(
    () => contentState
      ? EditorState.createWithContent(contentState, createDecorator())
      : EditorState.createEmpty(createDecorator())
  )

  const _onChange = newEditorState => {
    // prevent changes until decorator has been set
    if (newEditorState.getDecorator() === null) return

    setEditorState(onChange(newEditorState))
  }

  return (
    <DraftEditor
      editorState={editorState}
      onChange={_onChange}
      {...otherProps}
    />
  )
}
