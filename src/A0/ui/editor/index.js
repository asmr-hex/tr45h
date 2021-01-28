import React, { useState } from 'react'

import { Editor } from '../lib/editor'

import {
  useStyles,
  useRuntime,
  useDictionary,
  useAnnotations,
} from '../../state'


export const MusicEditor = props => {
  const { theme }                = useStyles()
  const { dictionary }           = useDictionary()
  const { interpreter, symbols } = useRuntime()
  const { annotator }            = useAnnotations()
  
  const interpret = (key, index, text) => annotator.update(key, interpreter.analyzeBlock(key, index, text))

  const onChange = newEditorState => {
    annotator.check(newEditorState.getSelection())
    return newEditorState
  }
  
  
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

  return (
    <Editor
      interpret={interpret}
      getTokenStyles={getTokenStyles}
      dictionary={dictionary}
      onChange={onChange}
    />
  )
}
