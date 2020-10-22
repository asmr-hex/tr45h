import React from 'react'
import './App.css'

import { SequenceProvider } from './context/sequence'
import { MusicEditor } from './editor'
import { Sequencer } from './sequencer'



const App = () => {
  return (
    <div className="App">
      <SequenceProvider>
        <header className="App-header">
          <MusicEditor/>
          <Sequencer/>
        </header>
      </SequenceProvider>
    </div>
  );
}

export default App;
