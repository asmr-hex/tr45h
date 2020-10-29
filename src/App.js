import React, { useState } from 'react'
import './App.css'

import { SequenceProvider } from './context/sequence'
import { MusicEditor } from './editor'
import { Sequencer } from './sequencer'
import { SequenceVisualizer } from './visualizer'
import { Toolbar } from  './toolbar'



const App = () => {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const playback = {
    isPlaying,
    isPaused,
    isRecording,
    setIsPlaying,
    setIsPaused,
    setIsRecording,
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
          <Sequencer isRecording={isRecording} isPlaying={isPlaying} isPaused={isPaused}/>
        </header>
      </SequenceProvider>
    </div>
  );
}

export default App;
