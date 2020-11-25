import React, { useState } from 'react'
import {
  makeStyles,
  withTheme,
  styled
} from "@material-ui/core/styles"

import { SequenceProvider } from './context/sequence'
import { MusicEditor } from './editor/index'
import { Sequencer } from './sequencer'
import { SequenceVisualizer } from './visualizer'
import { Toolbar } from  './toolbar'


const AppContainer = withTheme(styled('div')({
  textAlign: 'center',
}))

const AppBody = withTheme(styled('header')({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  fontSize: 'calc(10px + 2vmin)',
  paddingTop: '100px',
}))


const App = () => {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [bpm, setBpm] = useState(128)
  const playback = {
    isPlaying,
    isPaused,
    isRecording,
    setIsPlaying,
    setIsPaused,
    setIsRecording,
    bpm,
    setBpm,
  }
  
  return (
    <AppContainer>
      <Toolbar {...playback}/>
      <AppBody>
           <div style={{display: 'flex', flexDirection: 'row', height: '100%', width: '100%', justifyContent: 'center'}}>
            <MusicEditor/>
          </div>
          {/* <Sequencer isRecording={isRecording} isPlaying={isPlaying} isPaused={isPaused} bpm={bpm}/> */}
      </AppBody>
    </AppContainer>
  );
}

export default App;
