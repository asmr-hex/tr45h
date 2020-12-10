import React from 'react'
import {
  withTheme,
  styled
} from "@material-ui/core/styles"


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

export const Details = props => {
  const isError = false
  
  return (
    <DetailsBody hasError={isError}>
      some deets
    </DetailsBody>
  )
}
