import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTheme } from "@material-ui/core/styles"
import { BehaviorSubject } from 'rxjs'

import { useCliStyles } from '../ui/cli/style'
import { useSyntaxStyles, useEditorStyles } from '../ui/editor/style'


const StyleContext = createContext()

export const useStyles = () => {
  const ctx = useContext(StyleContext)
  if (ctx === undefined) {
    throw new Error(`useStyles must be invoked in a child component of StyleProvider`)
  }
  return ctx
}

export const StyleProvider = props => {
  const theme = {
    styles:  useTheme(),
    classes: {
      lang: useSyntaxStyles(),
      cli:  useCliStyles(),
      editor: useEditorStyles(),
    }
  }
  const [observable, _] = useState(new BehaviorSubject(theme))
  useEffect(() => observable.next(theme), [theme])

  const context = {
    theme,
    observable,
  }
  
  return (
    <StyleContext.Provider value={context}>
      {props.children}
    </StyleContext.Provider>
  )
}
