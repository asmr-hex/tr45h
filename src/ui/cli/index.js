import React, { useEffect, useState, useRef } from 'react'
import {
  ContentState,
  EditorState,
  Editor,
} from 'draft-js'
import Typography from '@material-ui/core/Typography'
import { useTheme } from "@material-ui/core/styles"
import { BehaviorSubject } from 'rxjs'

import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Dialog,
} from './dialog'
import { useUIStateContext } from '../../context/ui'

import { CLI as CommandLineInterface } from '../../cli'

import { AutoSuggest } from '../autosuggest'

import { KeyBindingFn, KeyBoundAction } from './keybinding'
import { CLIDecorator } from './decorator'
import { useCLIStyles } from './styles'


export const CLI = props => {
  const {
    isCLIOpen,
    closeCLI,
  } = useUIStateContext()

  const theme = {
    styles: useTheme(),
    classes: useCLIStyles(),
  }
  const themeObservableRef = useRef(new BehaviorSubject(theme))
  useEffect(() => { themeObservableRef.current.next(theme) }, [theme])

  // EXPERIMENTAL AUTO-COMPLETE
  const [currentSuggestion, setCurrentSuggestion] = useState(null)
  
  const [cli, setCli] = useState(null)
  const [decorator, setDecorator] = useState(null)
  const [autosuggest, setAutoSuggest] = useState(null)
  const [ editorState, setEditorState ] = useState(
    () => EditorState.createEmpty()
  )
  const editorRef = useRef(null)

  const [InfoComponent, setInfoComponent] = useState(null)

  const open = isCLIOpen
  const handleClose = () => { closeCLI() }

  useEffect(() => {
    const cli = new CommandLineInterface()
    const decorator = new CLIDecorator(cli, themeObservableRef.current, setCurrentSuggestion)
    const autosuggest = new AutoSuggest(decorator, ['star', 'start', 'starfish', 'startlight', 'help', 'hell'])
    setEditorState(EditorState.set(editorState, {decorator}))
    setDecorator(decorator)
    setAutoSuggest(autosuggest)
    setCli(cli)
  }, [])
  
  const onEnter = () => {
    setInfoComponent(null)
    editorRef.current.focus()
    const emptyEditor = EditorState.push(editorState, ContentState.createFromText(''))
    const selection = emptyEditor.getSelection()
    setEditorState(EditorState.forceSelection(emptyEditor, selection))
  }
  
  const onChange = newEditorState => {
    setEditorState(autosuggest.analyze(newEditorState))
  }
  const handleKeyCommand = command => {
    switch (command) {
    case KeyBoundAction.CloseCLI:
      handleClose()
      return 'handled'
    case KeyBoundAction.ExecuteCommand:
      setInfoComponent(cli.execute())
      //handleClose()
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
        { InfoComponent ? InfoComponent : null }
      </Dialog>
    </div>
  );
}

