import React, { createContext, useContext, useState } from 'react'
import './audioMonkeyPatch'


const AudioReactContext = createContext()

export const useAudio = () => {
  const ctx = useContext(AudioReactContext)
  if (ctx === undefined) {
    throw new Error(`useAudio must be invoked in a child component of AudioProvider`)
  }
  return ctx
}

export const AudioProvider = props => {
  const [audioContext, setAudioContext] = useState(new AudioContext())
  
  const context = {
    audioContext,
  }

  return (
    <AudioReactContext.Provider value={context}>
      { props.children }
    </AudioReactContext.Provider>
  )
}
