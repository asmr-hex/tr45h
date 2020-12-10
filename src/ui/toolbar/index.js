import React from 'react'
import {
  makeStyles,
  withTheme,
  styled
} from "@material-ui/core/styles"
import {
  IconButton,
  // Slider,
  Switch,
  FormControlLabel,
} from '@material-ui/core'
import RecordIcon from '@material-ui/icons/FiberManualRecord'
import PlayIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import StopIcon from '@material-ui/icons/Stop'
import SoundOnIcon from '@material-ui/icons/VolumeUp'
import SoundOffIcon from '@material-ui/icons/VolumeOff'
import DarkIcon from '@material-ui/icons/Brightness3'
import LightIcon from '@material-ui/icons/WbSunny';
import SettingsIcon from '@material-ui/icons/Settings';

import { useTransportContext } from '../../context/transport'
import { useTheme } from '../themes'


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
  // position: 'fixed',
  // top: 0,
  // width: '100%',
  // backgroundColor: p => p.theme.palette.background.secondary, //'#23272e',
  // padding: '1% 0% 1% 0%',
  // zIndex: 999999,
  display: 'flex',
  justifyContent: 'space-around',
  
}))

const HeaderBody = withTheme(styled('div')({
  position: 'fixed',
  top: 0,
  width: '100%',
  backgroundColor: p => p.theme.palette.background.secondary, //'#23272e',
  padding: '1% 0% 1% 0%',
  zIndex: 999999,
  display: 'flex',
  justifyContent: 'space-between',
  boxShadow: '0px -3px 8px',
}))

const Logo = withTheme(styled('div')({
  marginLeft: '2%',
  fontFamily: 'gilbert',
  fontSize: '1.8rem',
  letterSpacing: '0.3rem',
  color: p => p.theme.palette.background.default,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  userSelect: 'none',
}))

const Settings = withTheme(styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  marginRight: '2%',
}))

const LogoLetter0 = withTheme(styled('span')({ color: p => p.theme.palette.logo[0] }))
const LogoLetter1 = withTheme(styled('span')({ color: p => p.theme.palette.logo[1] }))
const LogoLetter2 = withTheme(styled('span')({ color: p => p.theme.palette.logo[2] }))
const LogoLetter3 = withTheme(styled('span')({ color: p => p.theme.palette.logo[3] }))
const LogoLetter4 = withTheme(styled('span')({ color: p => p.theme.palette.logo[4] }))
const LogoLetter5 = withTheme(styled('span')({ color: p => p.theme.palette.logo[5] }))

export const Toolbar = props => {
  const {
    isRecording,
    setIsRecording,
    isPlaying,
    setIsPlaying,
    isPaused,
    setIsPaused,
    isMuted,
    setIsMuted,
    // bpm,
    // setBpm
  } = useTransportContext()
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

  const toggleMute = e => {
    setIsMuted(!isMuted)
  }
  
  // const changeBpm = (e, newBpm) => {
  //   setBpm(newBpm)
  // }
  
  return (
    <HeaderBody>
      <Logo>
        <div>
          <LogoLetter0>A</LogoLetter0>
          <LogoLetter1>L</LogoLetter1>
          <LogoLetter2>E</LogoLetter2>
          <LogoLetter3>A</LogoLetter3>
          <LogoLetter4>-</LogoLetter4>
          <LogoLetter5>0</LogoLetter5>
        </div>
      </Logo>
      <ToolbarBody>
        <IconButton
          aria-label="play/pause"
          size="small"
          className={isPlaying ? classes.buttonPlaying : classes.buttonNotPlaying}
          onClick={togglePlayPause}>
          {
            isPaused
              ? <PlayIcon/>
              : isPlaying ? <PauseIcon/> : <PlayIcon/>
          }
        </IconButton>
        <IconButton aria-label="stop" size="small" className={isPlaying ? classes.buttonNotStopped : classes.buttonStopped } onClick={stopPlayback}>
          <StopIcon />
        </IconButton>
        <IconButton aria-label="record" size="small" className={isRecording? classes.buttonRecording : classes.buttonNotRecording} onClick={toggleRecording}>
          <RecordIcon />
        </IconButton>
        <IconButton aria-label="mute" size="small" className={isRecording? classes.buttonRecording : classes.buttonNotRecording} onClick={toggleMute}>
          {
            isMuted
              ? <SoundOffIcon/>
              : <SoundOnIcon/>
          }
        </IconButton>
        <FormControlLabel
          control={<Switch name="theme" checked={isLightTheme} onChange={toggleTheme} inputProps={{ 'aria-label': 'secondary checkbox' }}/>}
          label={isLightTheme ? <LightIcon/> : <DarkIcon/>}
          className={classes.theme}
        />
        
        {/* <Slider value={bpm} onChange={changeBpm} min={50} max={400} valueLabelDisplay="on" className={classes.slider}/> */}
      </ToolbarBody>
      <Settings>
        <IconButton aria-label="settings" size="small" onClick={() => {console.log("hi")}}>
          <SettingsIcon />
        </IconButton>        
      </Settings>
    </HeaderBody>
  )
}
