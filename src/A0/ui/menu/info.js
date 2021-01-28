import React from 'react'
import { withTheme, styled } from '@material-ui/core/styles'

import { useAnnotations } from '../../state'
import { SemanticTokenType } from '../../lang/types'


const InfoContainer = withTheme(styled('div')({
  display: 'flex',
  flexGrow: 1,
  overflow: 'hidden',
}))

const InfoType = withTheme(styled('div')({
  margin: '0% 1% 0% 1%',
}))

const InfoDetails = withTheme(styled('div')({
  display: 'flex',
  flexGrow: 1,
  margin: '0% 1% 0% 1%',
  overflow: 'hidden',
}))

const InfoDetailStyled = withTheme(styled('div')({
  whiteSpace: 'nowrap',
  margin: '0% 1% 0% 1%',
  color: p => p.props.color || 'white',
  maxWidth: p => p.props.maxWidth || '100%',
}))


const InfoDetail = props => {
  const {
    truncate = false,
  } = props

  let styles = truncate ? {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
  } : {}

  return (
    <InfoDetailStyled style={styles} props={props}>
      {props.children}
    </InfoDetailStyled>
  )
}


export const SoundInfo = props => {
  const { details } = props
  
  const status = details.symbol.status.toLowerCase() //'downloading'
  const name = details.symbol.metadata ? details.symbol.metadata.name : '' //'tin whistle of some sort'
  const description = details.symbol.metadata ? details.symbol.metadata.description : '' //'the sound of a tin whistle on the blarney stone of something'
  
  return (
    <InfoDetails>
      <InfoDetail color={'lightgreen'}>{status}</InfoDetail>
      <InfoDetail truncate maxWidth={'60%'} color={'cornflowerblue'}>{name}</InfoDetail>
      <InfoDetail truncate>{description}</InfoDetail>
    </InfoDetails>
  )
}

export const ErrorInfo = props => {
  return (
    <div>error</div> 
  )
}

const DetailTypes = {
  [SemanticTokenType.SoundLiteral]: d => <SoundInfo details={d}/>
}

export const Info = props => {  
  const { annotation } = useAnnotations()
  const type = annotation === null ? null : annotation.token.type

  if (!(type in DetailTypes)) return null

  return (
    <InfoContainer>
      <InfoType>𝄆</InfoType>
      { DetailTypes[type](annotation) }
    </InfoContainer>
  )
}
