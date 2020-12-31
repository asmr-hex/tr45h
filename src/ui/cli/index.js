import React, { useEffect, useState, useRef } from 'react'
import {
  ContentState,
  EditorState,
  Editor,
} from 'draft-js'
import Typography from '@material-ui/core/Typography'

import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
} from './dialog'
import { useUIStateContext } from '../../context/ui'

import { KeyBindingFn, KeyBoundAction } from './keybinding'
import { CLIDecorator } from './decorator'

export const CLI = props => {
  const {
    isCLIOpen,
    closeCLI,
  } = useUIStateContext()

  const [decorator, setDecorator] = useState(null)
  const [ editorState, setEditorState ] = useState(
    () => EditorState.createEmpty()
  )
  const editorRef = useRef(null)

  const open = isCLIOpen
  const handleClose = () => { closeCLI() }

  useEffect(() => {
    const decorator = new CLIDecorator()
    setEditorState(EditorState.set(editorState, {decorator}))
  }, [])
  
  const onEnter = () => {
    editorRef.current.focus()
    const emptyEditor = EditorState.push(editorState, ContentState.createFromText(''))
    const selection = emptyEditor.getSelection()
    setEditorState(EditorState.forceSelection(emptyEditor, selection))
  }
  
  const onChange = newEditorState => setEditorState(newEditorState)
  const handleKeyCommand = command => {
    switch (command) {
    case KeyBoundAction.CloseCLI:
      handleClose()
      return 'handled'
    case KeyBoundAction.ExecuteCommand:
      handleClose()
      return 'handled'
    default:
      return 'not-handled'
    }
  }
  
  return (
    <div>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        scroll={'paper'}
        onEnter={() => onEnter()}
        transitionDuration={30}
        >
        <Editor
          ref={editorRef}
          editorState={editorState}
          onChange={onChange}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={KeyBindingFn}
          />
      </Dialog>
    </div>
  );
}

