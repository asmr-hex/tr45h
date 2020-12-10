import React, { useEffect, useState, useRef } from 'react'
import {
  Editor,
  EditorState,
  DefaultDraftBlockRenderMap,
} from 'draft-js'
import 'draft-js/dist/Draft.css'
import { Map } from 'immutable'
import { useTheme } from "@material-ui/core/styles"

import { useTransportContext } from '../../context/transport'

import { SyntaxHighlightDecorator } from './decorator'
import { StatementBlock } from './statementBlock'
import { useSyntaxStyles } from './styles'

import { Interpreter } from '../../interpreter'


/**
 * MusicEditor is the main editor for writing aleatoric music
 */
export const MusicEditor = props => {
  const theme = useTheme()
  const styleClasses = useSyntaxStyles()

  // get playback observables to pass to the interpreter
  const transport = useTransportContext()
  
  // declare interpreter & decorator
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
    const themeMap = {styles: theme, classes: styleClasses}
    const interpreter = new Interpreter({
      transport: transport.observables,
      theme: themeMap,
    })
    const decorator = new SyntaxHighlightDecorator(interpreter, themeMap)
    setEditorState(EditorState.set(editorState, {decorator}))
    setDecorator(decorator)
    setInterpreter(interpreter)
  }, [])

  // update theme inside intrpreter
  useEffect(() => {
    const themeMap = {styles: theme, classes: styleClasses}
    if (interpreter) {
      interpreter.updateTheme(themeMap)
      decorator.updateTheme(themeMap)
    }
  }, [theme, styleClasses])
  
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

  return (
    <div style={{width: '50%', height: '50%'}}>
      <Editor
        ref={editorRef}
        editorState={editorState}
        onChange={onChange}
        blockRenderMap={blockRenderMap}
      />
    </div>
  )
}
