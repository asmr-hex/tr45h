import React, { createContext, useContext, useState } from 'react'
import './audioMonkeyPatch'

// TODO eventually, put this in the context...?
export const audioContext = new AudioContext()

const AudioReactContext = createContext()

export const useAudioContext = () => {
  const ctx = useContext(AudioReactContext)
  if (ctx === undefined) {
    throw new Error(`useAudioContext must be invoked in a child component of AudioProvider`)
  }
  return ctx
}

export const AudioProvider = props => {
  const [audioScheduler, setAudioScheduler] = useState(null)
  
  const context = {
    audioScheduler,
    setAudioScheduler,
  }

  return (
    <AudioReactContext.Provider value={context}>
      { props.children }
    </AudioReactContext.Provider>
  )
}
