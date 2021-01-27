import React, { useState } from 'react'

import { Editor } from '../../editor'

import {
  useRuntime,
  useDictionary,
} from '../../state'


export const MusicEditor = props => {
  const { interpreter } = useRuntime()
  const { dictionary }  = useDictionary()
  
  const interpret = (blockKey, blockIndex, blockText) => {
    // TODO call interpreter method
  }

  const getTokenStyles = (key, token) => {
    // idk
  }
  
  return (
    <Editor
      interpret={interpret}
      getTokenStyles={getTokenStyles}
      dictionary={dictionary}
    />
  )
}
