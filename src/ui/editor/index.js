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

import { useTransportContext } from '../../context/transport'

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
  
  // declare interpreter & decorator
  const [interpreter, setInterpreter] = useState(null)
  const [decorator, setDecorator] = useState(null)

  // references
  const [blockTokens, setBlockTokens] = useState({})

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
    const interpreter = new Interpreter({
      transport: transport.observables,
      theme: themeObservableRef.current,
    })
    const decorator = new SyntaxHighlightDecorator(interpreter, themeObservableRef.current)
    setEditorState(EditorState.set(editorState, {decorator}))
    setDecorator(decorator)
    setInterpreter(interpreter)
  }, [])


  // EXPERIMENT
  // useEffect(() => {
  //   if (!blockTokens || !blockTokens.tokens) return
  //   //console.log(blockTokens)
  //   // create entities for new block tokens
  //   const blockKey = blockTokens.block
  //   let contentState = editorState.getCurrentContent()
  //   for (const token of blockTokens.tokens) {
  //     contentState = contentState.createEntity('SOUND_LITERAL', 'MUTABLE', { token })
  //     const selection = SelectionState.createEmpty(blockKey)
  //           .merge({
  //             anchorOffset: token.start,
  //             focusOffset: token.start + token.length - 1,
  //           })
  //     contentState = Modifier.applyEntity(
  //       contentState,
  //       selection,
  //       contentState.getLastCreatedEntityKey()
  //     )
  //   }

  //   //setEditorState(e => EditorState.set(e, { currentContent: contentState }))
  // }, [blockTokens])
  
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


    // EXPERIMENT: adding entity annotations for all sound literals (and eventually errors)
    // NOTES:
    // this is currently very cpu intensive sporadically.
    // it looks like this is happening whenever the editor is changed, including
    //  * adding new characters
    //  * focusing the editor
    //  * moving the cursor
    //
    // there are several candidates for the performance issues:
    // (1) NOPE - creating entities on every change
    // (2) NOPE - applying entities on every change
    // (3) THIS SEEMS TO BE IT - setting new editor state
    // (4) NOPE - checking if selection is on entitiy on every change
    // (5) NOPE - updating the scheduler.... (though this wasn't happening before the entity code was added)
    //
    // REMEDIATION PLAN:
    // maybe debounce and memoize the entities that should be set per block.
    
    let contentState = newEditorState.getCurrentContent()
    if (decorator) {
      // get new tokens
      for (const token of decorator.getNewTokens()) {
        contentState = contentState.createEntity('SOUND_LITERAL', 'MUTABLE', { token })
        const selection = SelectionState.createEmpty(token.block)
              .merge({
                anchorOffset: token.start,
                focusOffset: token.start + token.length,
              })
        contentState = Modifier.applyEntity(
          contentState,
          selection,
          contentState.getLastCreatedEntityKey()
        )
      }
      
      newEditorState = EditorState.set(newEditorState, { currentContent: contentState }) 
    }
    
    // console.log(convertToRaw(newEditorState.getCurrentContent()).entityMap)

    // get current selection
    const selection = newEditorState.getSelection()
    if (selection.isCollapsed()) {
      // get content block caret is within
      const block = contentState.getBlockForKey(selection.getAnchorKey())

      const entity = block.getEntityAt(selection.anchorOffset)
      if (entity) {
        console.log(contentState.getEntity(entity).data.token.id)
      }
    }
    
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
