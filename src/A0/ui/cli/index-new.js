import React, { useEffect, useState, useRef } from 'react'
import {
  ContentState,
  EditorState,
  Editor,
  convertToRaw,
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
import { useDictionaryContext } from '../../context/dictionary'
import { useSymbolContext } from '../../context/symbols'

import { CLI as CommandLineInterface } from '../../cli'

import { AutoSuggest } from '../autosuggest'

import { KeyBindingFn, KeyBoundAction } from './keybinding'
import { CLIDecorator } from './decorator'
import { useCLIStyles } from './styles'


export const CLI = props => {
  const {
    setSuggestions,
  } = props
  const {
    isCLIOpen,
    closeCLI,
    isCliFocused,
    blurCLI,
    openExplorer,
  } = useUIStateContext()

  const { symbols } = useSymbolContext()
  const { dictionary } = useDictionaryContext()

  const theme = {
    styles: useTheme(),
    classes: useCLIStyles(),
  }
  const themeObservableRef = useRef(new BehaviorSubject(theme))
  useEffect(() => { themeObservableRef.current.next(theme) }, [theme])
  
  const [cli, setCli] = useState(null)
  const [decorator, setDecorator] = useState(null)
  const [autosuggest, setAutoSuggest] = useState(null)
  const [ editorState, setEditorState ] = useState(
    () => EditorState.createEmpty()
  )
  const editorRef = useRef(null)

  const [InfoComponent, setInfoComponent] = useState(null)

  const open = isCLIOpen
  const handleClose = () => { blurCLI() }

  useEffect(() => {
    const cli = new CommandLineInterface({ symbols, actions: { openExplorer } })
    const decorator = new CLIDecorator(cli, themeObservableRef.current)
    const autosuggest = new AutoSuggest(decorator, setSuggestions, dictionary)

    const emptyEditor = EditorState.push(editorState, ContentState.createFromText(''))
    const selection = emptyEditor.getSelection()
    
    
    setEditorState(EditorState.set(EditorState.forceSelection(emptyEditor, selection), {decorator}))
    setDecorator(decorator)
    setAutoSuggest(autosuggest)
    setCli(cli)
  }, [])

  useEffect(() => {
    if (isCliFocused) {
      editorRef.current.focus()
    }
  }, [isCliFocused])

  const onEnter = () => {
    setInfoComponent(null)
    editorRef.current.focus()
    const emptyEditor = EditorState.push(editorState, ContentState.createFromText(''))
    const selection = emptyEditor.getSelection()
    setEditorState(EditorState.forceSelection(emptyEditor, selection))
  }
  
  const onChange = newEditorState => {
    if (autosuggest === null) return
    setEditorState(autosuggest.analyze(newEditorState))
  }
  const handleKeyCommand = command => {
    switch (command) {
    case KeyBoundAction.CloseCLI:
      handleClose()
      return 'handled'
    case KeyBoundAction.ExecuteCommand:
      cli.execute()
      handleClose()
      return 'handled'
    case KeyBoundAction.CycleSuggestions:
      setEditorState(autosuggest.cycleSuggestions(editorState))
      return 'handled'
    case KeyBoundAction.AutoComplete:
      setEditorState(autosuggest.complete(editorState))
      return 'handled'
    default:
      return 'not-handled'
    }
  }

  return (
    <Editor
      ref={editorRef}
      editorState={editorState}
      onChange={onChange}
      onBlur={handleClose}
      handleKeyCommand={handleKeyCommand}
      keyBindingFn={KeyBindingFn}
    />
  );
}

