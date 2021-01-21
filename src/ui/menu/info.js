import React from 'react'
import { withTheme, styled } from '@material-ui/core/styles'

const truncateText = {
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',  
}

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


export const Info = props => {  
  
  return (
    <InfoContainer>
      <InfoType>𝄆</InfoType>
      <SoundInfo/>
    </InfoContainer>
  )
}

export const SoundInfo = props => {
  const status = 'downloading'
  const name = 'tin whistle of some sort'
  const description = 'the sound of a tin whistle on the blarney stone of something'
  
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
