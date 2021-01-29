import React, { createContext, useContext, useState, useEffect } from 'react'

import { useRuntime } from 'A0/state'
import { Annotator } from 'A0/ui/annotator'


const AnnotationContext = createContext()

export const useAnnotations = () => {
  const ctx = useContext(AnnotationContext)
  if (ctx === undefined) {
    throw new Error(`AnnotationContext must be invoked in a child component of AnnotationProvider`)
  }
  return ctx
}

export const AnnotationProvider = props => {
  const { symbols }                   = useRuntime()
  const [ annotation, setAnnotation ] = useState(null)
  const [ annotator ]                 = useState(new Annotator({ symbols, setAnnotation }))

  const context = {
    annotator,
    annotation,
  }
  
  return (
    <AnnotationContext.Provider value={context}>
      {props.children}
    </AnnotationContext.Provider>
  )
}
