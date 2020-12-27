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
} from '../toolbar/dialog/customDialog'
import { useUIStateContext } from '../../context/ui'

import { KeyBindingFn } from './keybinding'

export const CLI = props => {
  const {
    isCLIOpen,
    closeCLI,
  } = useUIStateContext()

  const [ editorState, setEditorState ] = useState(
    () => EditorState.createEmpty()
  )
  const editorRef = useRef(null)

  // useEffect(() => {
  //   if (editorRef.current) {
  //     editorRef.current.focus() 
  //   }
  // }, [isCLIOpen, editorRe])
  
  const open = isCLIOpen
  const handleClose = () => { closeCLI() }

  const onChange = newEditorState => setEditorState(newEditorState)
  const handleKeyCommand = command => {
    switch (command) {
    default:
      return 'not-handled'
    }
  }
  
  return (
    <div>
      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={open} scroll={'paper'} >
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

