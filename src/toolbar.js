import React from 'react'
import { makeStyles } from "@material-ui/core/styles"
import { IconButton } from '@material-ui/core'
import RecordIcon from '@material-ui/icons/FiberManualRecord'


const useStyles = makeStyles(theme => ({
  buttonNotRecording: {
    color: '#544247',
    "&:hover, &.Mui-focusVisible": { backgroundColor: "#3b2e32" },
  },
  buttonRecording: {
    color: '#f26f94',
    "&:hover, &.Mui-focusVisible": { backgroundColor: "#964a5f" },
  },
}))

export const Toolbar = props => {
  const {
    isRecording,
    setIsRecording,
  } = props
  const classes = useStyles()
  const styles = {
    position: 'fixed',
    top: 0,
    width: '100%',
    backgroundColor: '#23272e',
    padding: '1% 0% 1% 0%',
    zIndex: 999999,
  }

  const toggleRecording = e => setIsRecording(isRecording => !isRecording)
  
  return (
    <div style={styles}>
      <IconButton aria-label="record" size="small" className={isRecording? classes.buttonRecording : classes.buttonNotRecording} onClick={toggleRecording}>
        <RecordIcon />
      </IconButton>
    </div>
  )
}
