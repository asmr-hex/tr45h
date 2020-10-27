import React, { useState } from 'react'
import './App.css'

import { SequenceProvider } from './context/sequence'
import { MusicEditor } from './editor'
import { Sequencer } from './sequencer'
import { SequenceVisualizer } from './visualizer'
import { Toolbar } from  './toolbar'



const App = () => {
  const [isRecording, setIsRecording] = useState(false)

  return (
    <div className="App">
      <Toolbar {...{isRecording, setIsRecording}}/>
      <SequenceProvider>
        <header className="App-header">
           <div style={{display: 'flex', flexDirection: 'row', height: '100%', width: '100%', justifyContent: 'center'}}>
            <MusicEditor/>
            {/* <SequenceVisualizer/> */}
          </div>
          <Sequencer isRecording={isRecording}/>
        </header>
      </SequenceProvider>
    </div>
  );
}

export default App;
