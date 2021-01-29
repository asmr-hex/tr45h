import React, { useEffect, useState } from 'react'
import { DefaultDraftBlockRenderMap } from 'draft-js'
import { Map } from 'immutable'

import { Editor } from '../lib/editor'

import {
  useStyles,
  useRuntime,
  useUIState,
  useDictionary,
  useAnnotations,
} from 'A0/state'

import { LineBlock, visuallyMark} from './line'
import { KeyBindingFn, KeyBoundAction } from './keybindings'


export const MusicEditor = props => {
  const { theme }                       = useStyles()
  const { focusCLI }                    = useUIState()
  const { dictionary }                  = useDictionary()
  const { interpreter, symbols }        = useRuntime()
  const { annotator, annotation }       = useAnnotations()
  const [ currentLine, setCurrentLine ] = useState(null)

  
  const interpret = (key, index, text) => annotator.update(key, interpreter.analyzeBlock(key, index, text))

  const onChange = newEditorState => {
    const selection = newEditorState.getSelection()
    annotator.check(selection)
    setCurrentLine(selection.getAnchorKey())
    return newEditorState
  }

  useEffect(() => {
    if (currentLine) visuallyMark(currentLine, theme)
  }, [currentLine])
  
  
  const getTokenStyles = (key, token) => {
    const symbol        = symbols.get(token)
    const elements      = document.getElementsByClassName(key)
    const isCurrentStep = elements.length !== 0
          ? elements[0].classList.contains(theme.classes.currentStep)
          : false
    
    return {
      classes: [
        token.id ? token.id : '',                                  // symbol id
        key,                                                       // unique id
        theme.classes.lang[token.type.toLowerCase()],              // syntactical type
        symbol === null ? '' : theme.classes.lang[symbol.status],  // symbol status
        isCurrentStep ? theme.classes.lang.currentStep : '',       // current step
      ],
      styles: {}
    }
  }

  const blockRenderMap = DefaultDraftBlockRenderMap.merge(
    Map({
      'unstyled': {
        element: 'div',
        wrapper: <LineBlock/>
      }
    })
  )

  const handleKeyCommand = command => {
    switch (command) {
    case KeyBoundAction.GetNewSound:
      if (annotation.symbol) {
        annotation.symbol.reFetch({symbolTable: symbols})
      }
      return 'handled'
    case KeyBoundAction.CycleAutoCompletion:
      console.log("Cycle Autocompletion")
      // TODO
      return 'handled'
    case KeyBoundAction.FocusCLI:
      focusCLI()
      return 'handled'
    default:
      return 'not-handled'
    }
  }
  
  // TODO refactor as css class with styled div
  const styles = {
    position: 'relative',
    width: 'calc(100% - 20px)',
    height: '93%',
    top: '6%',
    left: '20px',
    display: 'flex',
    overflowY: 'scroll',
  }
  
  return (
    <div style={styles}>
      <Editor
        interpret={interpret}
        getTokenStyles={getTokenStyles}
        dictionary={dictionary}
        onChange={onChange}
        blockRenderMap={blockRenderMap}
        handleKeyCommand={handleKeyCommand}
        keyBindingFn={KeyBindingFn}
      />
    </div>
  )
}
