import React from 'react'
import {
  withTheme,
  styled
} from "@material-ui/core/styles"
import {
  reduce,
} from 'lodash'

import logo from '../logo/logo-white.svg'
import { useAnnotationContext } from '../../context/annotation'
import {
  LexicalTokenType,
} from '../../interpreter/types/tokens'


const DetailsBody = withTheme(styled('div')({
  // position: 'fixed',
  top: 0,
  width: '100%',
  backgroundColor: '#363636',//p => p.theme.palette.background.tertiary, //'#23272e',
  color: p => p.hasError ? 'red': p.theme.palette.text.tertiary,
  padding: '0.2% 0% 0.2% 0%',
  zIndex: 999999,
  display: 'flex',
  //justifyContent: 'space-between',
  // boxShadow: '0px 4px 6px',
}))

export const SoundAnnotation = props => {
  const { sound } = props

  const metadata = sound.metadata === null
        ? ''
        : `${sound.metadata.name} (${sound.metadata.username}): ${sound.metadata.description}`

  return (
    <div>
      { `${sound.id} ... ${sound.status} ${metadata}` }
    </div>
  )
}

export const ErrorAnnotation = props => {
  const { error } = props

  return (
    <div>
      { `Error: ${reduce(error.reasons, (acc, r) => `${acc} ${r.toString()}`, '' )}` }
    </div>
  )
}

export const Annotation = props => {
  const { item: { token, symbol } } = props

  return (
    <div>
      {
        token.type === LexicalTokenType.Error
        ? <ErrorAnnotation error={token}/>
        : <SoundAnnotation sound={symbol}/>
      }
    </div>
  )
}

export const Details = props => {
  const { currentAnnotation } = useAnnotationContext()
  const isError = false

  const style = {
    height: '15px',
    margin: '0.2%',
    objectFit: 'fill'
  }
  
  return (
    <DetailsBody hasError={isError}>
      <img src={logo} style={style}/>
      {currentAnnotation === null ? '' : <Annotation item={currentAnnotation}/>}
    </DetailsBody>
  )
}
