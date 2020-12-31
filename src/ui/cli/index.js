import React, { useEffect, useState, useRef } from 'react'
import {
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

export const CLI = props => {
  const {
    isCLIOpen,
    closeCLI,
  } = useUIStateContext()

  const [ editorState, setEditorState ] = useState(
    () => EditorState.createEmpty()
  )
  const editorRef = useRef(null)

  const open = isCLIOpen
  const handleClose = () => { closeCLI() }

  const onEnter = () => {
    editorRef.current.focus()
  }
  
  const onChange = newEditorState => setEditorState(newEditorState)
  const handleKeyCommand = command => {
    switch (command) {
    case KeyBoundAction.CloseCLI:
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
        transitionDuration={50}
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

