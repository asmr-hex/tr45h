import React, { useEffect, useState, useRef } from 'react'
import {
  Editor,
  EditorState,
  SelectionState,
  convertToRaw,
  convertFromRaw,
  CompositeDecorator,
  Modifier,
  getDefaultKeyBinding,
} from 'draft-js'
import 'draft-js/dist/Draft.css'
import { intersection, reduce, uniq, xor } from 'lodash'

import { SyntaxHighlightDecorator } from './decorator'
import { Interpreter } from '../interpreter'
import '../interpreter/grammar.css'

/**
 * MusicEditor is the main editor for writing sound-phrase music
 *
 * @description
 * The behavior of this editor is as follows:
 *   * when a text change occurs, the line that was modified will be re-parsed
 *   * the results of the parsed input will be provided to the editor to update syntax highlighting
 *   * the results of the parsed input will be dispatched to the sequence reducer so the scheduler has access
 * 
 * QUESTIONS
 *  * what data shape will be most helpful for the scheduler?
 *  * what data shape will be most helpful for the syntax highlighting?
 */
export const MusicEditor = props => {
  // const {
  //   sequenceState,
  //   fetchNewSounds,
  //   sequenceDispatch,
  //   currentSteps
  // } = useSequenceContext()

  // declare interpreter
  const [interpreter, setInterpreter] = useState(null)

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
    const interpreter = new Interpreter()
    const decorator = new SyntaxHighlightDecorator(interpreter)
    setEditorState(EditorState.set(editorState, {decorator}))
    setInterpreter(interpreter)
  }, [])

  const reparse = e => {
    interpreter.parse(convertToRaw(editorState.getCurrentContent()).blocks)
  }

  const onChange = newEditorState => {
    // detect block deletions
    const newBlockKeys = newEditorState.getCurrentContent().getBlocksAsArray().map(b => b.key)
    const oldBlockKeys = editorState.getCurrentContent().getBlocksAsArray().map(b => b.key)
    const removedBlocks = intersection(xor(oldBlockKeys, newBlockKeys), oldBlockKeys)

    // detect previously non-empty, now empty blocks
    const oldBlockTextMap = reduce(
      editorState.getCurrentContent().getBlocksAsArray(),
      (acc, b) => ({...acc, [b.key]: b.text}),
      {}
    )
    const nowEmptyBlocks = newEditorState.getCurrentContent().getBlocksAsArray()
          .filter(b => {
            return oldBlockTextMap[b.key] && oldBlockTextMap[b.key].trim() !== '' && b.text.trim() === ''
          })
      .map(b => b.key)
                  
    // TODO prune AST with deleted / now empty blocks
    // console.log(uniq([...removedBlocks, ...nowEmptyBlocks]))
    
    setEditorState(newEditorState)
  }
  
  return (
    <div style={{width: '50%', height: '50%'}}>
      <button onClick={reparse}>reparse</button>
      <Editor
        ref={editorRef}
        editorState={editorState}
        onChange={onChange}
      />
    </div>
  )
}
