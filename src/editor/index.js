import React, { useState } from 'react'
import { Editor as DraftEditor, EditorState } from 'draft-js'
import 'draft-js/dist/Draft.css'

import { Decorator } from './decorator'


export const Editor = props => {
  const {
    contentState   = null,
    interpret      = null,
    dictionary     = null,
    setSuggestions = null,
    triggerSuggest = null,
    onChange       = newEditorState => newEditorState,
    showLines      = false,
  } = props

  const createDecorator = () => new Decorator(
    interpret,
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
      onChange={onChange}
    />
  )
}
