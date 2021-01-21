import React from 'react'
import { withTheme, styled } from '@material-ui/core/styles'


const PlaybackTools = withTheme(styled('div')({
  display: 'flex',
  width: '15%',
  justifyContent: 'space-between',
  margin: '0% 3% 0% 3%',
}))

const PlaybackButton = withTheme(styled('div')({
  margin: '0% 5% 0% 5%',
}))

export const Playback = props => {

  return (
    <PlaybackTools>
      <PlaybackButton>></PlaybackButton>
      <PlaybackButton>#</PlaybackButton>
      <PlaybackButton>O</PlaybackButton>
    </PlaybackTools>
  )
}
