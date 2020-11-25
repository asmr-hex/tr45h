import React from 'react'
import {
  makeStyles,
  withTheme,
  styled
} from "@material-ui/core/styles"
import {
  IconButton,
  Slider,
  Switch,
  FormGroup,
  FormControlLabel,
} from '@material-ui/core'
import RecordIcon from '@material-ui/icons/FiberManualRecord'
import PlayIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import StopIcon from '@material-ui/icons/Stop'
import DarkIcon from '@material-ui/icons/Brightness3'
import LightIcon from '@material-ui/icons/WbSunny';

import { Theme, useTheme } from './themes'



const useStyles = makeStyles(theme => ({
  buttonNotRecording: {
    marginLeft: '2%',
    marginRight: '2%',
    color: '#544247',
    "&:hover, &.Mui-focusVisible": { backgroundColor: "#3b2e32" },
  },
  buttonRecording: {
    marginLeft: '2%',
    marginRight: '2%',
    color: '#f26f94',
    "&:hover, &.Mui-focusVisible": { backgroundColor: "#964a5f" },
  },
  buttonPlaying: {
    marginLeft: '2%',
    marginRight: '2%',
    color: '#92e3f7',
    "&:hover, &.Mui-focusVisible": { backgroundColor: "#5c8894" },
  },
  buttonNotPlaying: {
    marginLeft: '2%',
    marginRight: '2%',
    color: '#4e717a',
    "&:hover, &.Mui-focusVisible": { backgroundColor: "#32464a" },
  },
  buttonStopped: {
    marginLeft: '2%',
    marginRight: '2%',
    color: '#b0ad56',
    "&:hover, &.Mui-focusVisible": { backgroundColor: "#4a492b" },
  },
  buttonNotStopped: {
    marginLeft: '2%',
    marginRight: '2%',
    color: '#faf566',
    "&:hover, &.Mui-focusVisible": { backgroundColor: "#b0ad56" },
  },
  slider: {
    thumb: {
      backgroundColor: 'red',
    },
  },
  theme: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
}))

const ToolbarBody = withTheme(styled('div')({
  position: 'fixed',
  top: 0,
  width: '100%',
  backgroundColor: p => p.theme.palette.background.secondary, //'#23272e',
  padding: '1% 0% 1% 0%',
  zIndex: 999999,
  display: 'flex',
  justifyContent: 'center',
  
}))

export const Toolbar = props => {
  const {
    isRecording,
    setIsRecording,
    isPlaying,
    setIsPlaying,
    isPaused,
    setIsPaused,
    bpm,
    setBpm
  } = props
  const classes = useStyles()
  // const styles = {
  //   position: 'fixed',
  //   top: 0,
  //   width: '100%',
  //   backgroundColor: '#23272e',
  //   padding: '1% 0% 1% 0%',
  //   zIndex: 999999,
  //   display: 'flex',
  //   justifyContent: 'center'
  // }

  const { isLightTheme, toggleTheme } = useTheme()
  
  const toggleRecording = e => {
    if (!isRecording) {
      setIsPlaying(true)
      setIsRecording(true)
    } else {
      setIsRecording(false)  
    }
  }
  const togglePlayPause = e => {
    if (isPlaying) {
      setIsPaused(paused => !paused)
      setIsRecording(false)
    } else {
      setIsPlaying(true)
    }
  }
  const stopPlayback = e => {
    setIsPlaying(false)
    setIsPaused(false)
    setIsRecording(false)
  }

  const changeBpm = (e, newBpm) => {
    setBpm(newBpm)
  }
  
  return (
    <ToolbarBody>
      <IconButton
        aria-label="play/pause"
        size="small"
        className={isPlaying ? classes.buttonPlaying : classes.buttonNotPlaying}
        onClick={togglePlayPause}>
        {
          isPaused
            ? <PlayIcon/>
            : <PauseIcon/>
        }
      </IconButton>
       <IconButton aria-label="stop" size="small" className={isPlaying ? classes.buttonNotStopped : classes.buttonStopped } onClick={stopPlayback}>
        <StopIcon />
      </IconButton>
      <IconButton aria-label="record" size="small" className={isRecording? classes.buttonRecording : classes.buttonNotRecording} onClick={toggleRecording}>
        <RecordIcon />
      </IconButton>
      <FormControlLabel
        control={<Switch name="theme" checked={isLightTheme} onChange={toggleTheme} inputProps={{ 'aria-label': 'secondary checkbox' }}/>}
        label={isLightTheme ? <LightIcon/> : <DarkIcon/>}
        classes={classes.theme}
      />
      
      {/* <Slider value={bpm} onChange={changeBpm} min={50} max={400} valueLabelDisplay="on" className={classes.slider}/> */}
    </ToolbarBody>
  )
}
