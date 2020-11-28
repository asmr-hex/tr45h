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
  DefaultDraftBlockRenderMap,
} from 'draft-js'
import 'draft-js/dist/Draft.css'
import { Map } from 'immutable'
import { useTheme, makeStyles } from "@material-ui/core/styles"
import { intersection, reduce, uniq, xor } from 'lodash'

import { SyntaxHighlightDecorator } from './decorator'
import { Interpreter } from '../interpreter'
import '../interpreter/grammar.css'


// make style classes for tokens and statuses
const useStyles = makeStyles(theme => ({
  identifier: { color: theme.palette.text.tokens.identifier },
  number: { color: theme.palette.text.tokens.number },
  separator: { color: theme.palette.text.tokens.separator },
  operator: { color: theme.palette.text.tokens.operator },
  comment: { color: theme.palette.text.tokens.comment },
  error: {
    color: theme.palette.text.tokens.error,
    backgroundColor: theme.palette.background.error,
  },
  searching: { color: theme.palette.text.status.searching },
  downloading: { color: theme.palette.text.status.downloading },
  available: { color: theme.palette.text.status.available },
  unavailable: { color: theme.palette.text.status.unavailable },
  currentStep: {
    borderBottom: `2px ${theme.palette.divider} solid`,
  },
}))


const StatementBlock = props => {
  const { interpreter, theme } = props
  return (
    <div>
      {
        props.children.map(editorBlock => {
          // get ContentBlock for this editorBlock
          const contentBlock = editorBlock.props.children.props.block
          const text = contentBlock.getText()
          const key = contentBlock.getKey()

          // TODO lookup color of this editor block in symbol table
          const isEmpty = text.trim() === ''
          

          const style = {
            borderLeft: `3px ${isEmpty ? '#ffffff00' : interpreter.ast.getStatementMetaData(key).color} solid`,
            paddingLeft: '10px',
          }        

          return <div style={style}>{editorBlock}</div>
        })
      }
    </div>
  )
}

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
  const theme = useTheme()
  const styleClasses = useStyles()
  
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
    const interpreter = new Interpreter(themeMap)
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
