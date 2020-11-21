import React, { useState } from 'react'
import './App.css'

import { SequenceProvider } from './context/sequence'
import { MusicEditor } from './editor/index'
import { Sequencer } from './sequencer'
import { SequenceVisualizer } from './visualizer'
import { Toolbar } from  './toolbar'



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
    <div className="App">
      <Toolbar {...playback}/>
      <SequenceProvider>
        <header className="App-header">
           <div style={{display: 'flex', flexDirection: 'row', height: '100%', width: '100%', justifyContent: 'center'}}>
            <MusicEditor/>
            {/* <SequenceVisualizer/> */}
          </div>
          {/* <Sequencer isRecording={isRecording} isPlaying={isPlaying} isPaused={isPaused} bpm={bpm}/> */}
        </header>
      </SequenceProvider>
    </div>
  );
}

export default App;
