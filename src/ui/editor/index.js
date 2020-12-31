import React, { useEffect, useState, useRef } from 'react'
import {
  convertToRaw,
  SelectionState,
  Modifier,
  Editor,
  EditorState,
  DefaultDraftBlockRenderMap,
} from 'draft-js'
import 'draft-js/dist/Draft.css'
import { Map } from 'immutable'
import { useTheme } from "@material-ui/core/styles"
import { BehaviorSubject } from 'rxjs'

import { useUIStateContext } from '../../context/ui'
import { useTransportContext } from '../../context/transport'
import { useAnnotationContext } from '../../context/annotation'

import { Annotator } from './annotations'
import { KeyBindingFn, KeyBoundAction } from './keybindings'
import { SyntaxHighlightDecorator } from './decorator'
import { StatementBlock } from './statementBlock'
import { useSyntaxStyles } from './styles'

import { Interpreter } from '../../interpreter'


/**
 * MusicEditor is the main editor for writing aleatoric music
 */
export const MusicEditor = props => {

  ///////////////////
  //               //
  //  SETUP STATE  //
  //               //
  ///////////////////

  const theme = {
    styles: useTheme(),
    classes: useSyntaxStyles(),
  }
  const themeObservableRef = useRef(new BehaviorSubject(theme))
  useEffect(() => { themeObservableRef.current.next(theme) }, [theme])
  
  // get playback observables to pass to the interpreter
  const transport = useTransportContext()

  // ui state
  const { isEditorOpen, openCLI } = useUIStateContext()

  // get annotation setter
  const { currentAnnotation, setCurrentAnnotation } = useAnnotationContext()
  
  // declare interpreter & decorator
  const [annotator, setAnnotator] = useState(null)
  const [interpreter, setInterpreter] = useState(null)
  const [decorator, setDecorator] = useState(null)

  // setup editor state
  const [editorState, setEditorState] = useState(
    () => EditorState.createEmpty()
  )
  const editorRef = useRef(null)
  
  // on mount, set interpreter and decorator.
  // note: we do this instead of creating a ref to store the interpreter since
  // a subsystem of the interpreter (scheduler) uses the WebAudio API. Thus, the
  // interpreter class must be instantiated when the browser has loaded the WebAudio
  // API (e.g. on initial component mount)
  useEffect(() => {
    editorRef.current.focus()
    const interpreter = new Interpreter({
      transport: transport.observables,
      theme: themeObservableRef.current,
    })
    const _annotator = new Annotator(setCurrentAnnotation, interpreter.sym)
    const decorator = new SyntaxHighlightDecorator(interpreter, themeObservableRef.current, _annotator)
    setAnnotator(_annotator)
    setEditorState(EditorState.set(editorState, {decorator}))
    setDecorator(decorator)
    setInterpreter(interpreter)
  }, [])

  // TODO for some reason this prevents parsing from happening??
  // useEffect(() => {
  //   if (isEditorOpen) editorRef.current.focus()
  // }, [isEditorOpen])
  
  const onChange = newEditorState => {
    // // detect block deletions
    // const newBlockKeys = newEditorState.getCurrentContent().getBlocksAsArray().map(b => b.key)
    // const oldBlockKeys = editorState.getCurrentContent().getBlocksAsArray().map(b => b.key)
    // const removedBlocks = intersection(xor(oldBlockKeys, newBlockKeys), oldBlockKeys)

    // // detect previously non-empty, now empty blocks
    // const oldBlockTextMap = reduce(
    //   editorState.getCurrentContent().getBlocksAsArray(),
    //   (acc, b) => ({...acc, [b.key]: b.text}),
    //   {}
    // )
    // const nowEmptyBlocks = newEditorState.getCurrentContent().getBlocksAsArray()
    //       .filter(b => {
    //         return oldBlockTextMap[b.key] && oldBlockTextMap[b.key].trim() !== '' && b.text.trim() === ''
    //       })
    //   .map(b => b.key)
                  
    // TODO prune AST with deleted / now empty blocks
    // console.log(uniq([...removedBlocks, ...nowEmptyBlocks]))


    if (annotator !== null)
      annotator.check(newEditorState.getSelection())
    
    setEditorState(newEditorState)
  }

  // 
  const blockRenderMap = DefaultDraftBlockRenderMap.merge(
    Map({
      'unstyled': {
        element: 'div',
        wrapper: <StatementBlock interpreter={interpreter} theme={theme}/>
      }
    })
  )

  const handleKeyCommand = command => {
    switch (command) {
    case KeyBoundAction.GetNewSound:
      if (currentAnnotation.symbol) {
        currentAnnotation.symbol.reFetch({symbolTable: interpreter.sym})
      }
      return 'handled'
    case KeyBoundAction.OpenCLI:
      openCLI()
      return 'handled'
    case KeyBoundAction.CycleAutoCompletion:
      console.log("Cycle Autocompletion")
      // TODO
      return 'handled'
    default:
      return 'not-handled'
    }
  }
  
  return (
    <div style={{width: '50%', height: '50%'}}>
      <Editor
        ref={editorRef}
        editorState={editorState}
        onChange={onChange}
        blockRenderMap={blockRenderMap}
        handleKeyCommand={handleKeyCommand}
        keyBindingFn={KeyBindingFn}
      />
    </div>
  )
}
