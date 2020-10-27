import React, { useState } from 'react'
import './App.css'

import { SequenceProvider } from './context/sequence'
import { MusicEditor } from './editor'
import { Sequencer } from './sequencer'
import { SequenceVisualizer } from './visualizer'



const App = () => {
  const [isRecording, setIsRecording] = useState(false)

  const toggleRecording = e => setIsRecording(isRecording => !isRecording)
  
  return (
    <div className="App">
      <SequenceProvider>
        <header className="App-header">
          <div style={{display: 'flex', flexDirection: 'row', height: '100%', width: '100%', justifyContent: 'center'}}>
            <MusicEditor/>
            {/* <SequenceVisualizer/> */}
            <button onClick={toggleRecording}>{isRecording ? 'stop' : 'start'}</button>
          </div>
          <Sequencer isRecording={isRecording}/>
        </header>
      </SequenceProvider>
    </div>
  );
}

export default App;
