import React from 'react'
import {
  withTheme,
  styled
} from "@material-ui/core/styles"

import { useAnnotationContext } from '../../context/annotation'


const DetailsBody = withTheme(styled('div')({
  position: 'fixed',
  bottom: 0,
  width: '100%',
  backgroundColor: p => p.theme.palette.background.tertiary, //'#23272e',
  color: p => p.hasError ? 'red': p.theme.palette.text.tertiary,
  padding: '0.2% 0% 0.2% 0%',
  zIndex: 999999,
  display: 'flex',
  justifyContent: 'space-between',
  // boxShadow: '0px 4px 6px',
}))

export const Annotation = props => {
  const { item: { token, symbol } } = props
  const metadata = symbol.metadata === null
        ? ''
        : `${symbol.metadata.name} (${symbol.metadata.username}): ${symbol.metadata.description}`

  return (
    <div>
      { `${symbol.id} ... ${symbol.status} ${metadata}` }
    </div>
  )
}

export const Details = props => {
  const { currentAnnotation } = useAnnotationContext()
  const isError = false

  return (
    <DetailsBody hasError={isError}>
      {currentAnnotation === null ? '' : <Annotation item={currentAnnotation}/>}
    </DetailsBody>
  )
}
