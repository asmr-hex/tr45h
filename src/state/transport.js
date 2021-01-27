import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { BehaviorSubject } from 'rxjs'


const TransportContext = createContext()

export const useTransport = () => {
  const ctx = useContext(TransportContext)
  if (ctx === undefined) {
    throw new Error(`useTransport must be invoked in a child component of TransportProvider`)
  }
  return ctx
}

/**
 * Provides state for transport / playback.
 *
 * @description an important detail of this context is that it not only stores the data
 * for each state in a React State object, but also in an rxjs Behavior Subject. Why is the
 * state duplicated? Because part of the codebase (in particular, Scheduler) which relies on
 * this state, is not hooked into the React state tree because it lives outside of React world.
 * So, rxjs will allow non-React subsystems to subscribe to changes in a simple way.
 *
 */
export const TransportProvider = props => {
  // play state
  const [isPlaying, setIsPlaying] = useState(true)
  const isPlayingSubjectRef = useRef(new BehaviorSubject(isPlaying))
  useEffect(() => { isPlayingSubjectRef.current.next(isPlaying) }, [isPlaying])

  // pause state
  const [isPaused, setIsPaused] = useState(false)
  const isPausedSubjectRef = useRef(new BehaviorSubject(isPaused))
  useEffect(() => { isPausedSubjectRef.current.next(isPaused) }, [isPaused])

  // recording state
  const [isRecording, setIsRecording] = useState(false)
  const isRecordingSubjectRef = useRef(new BehaviorSubject(isRecording))
  useEffect(() => { isRecordingSubjectRef.current.next(isRecording) }, [isRecording])

  // mute state
  const [isMuted, setIsMuted] = useState(false)
  const isMutedSubjectRef = useRef(new BehaviorSubject(isMuted))
  useEffect(() => { isMutedSubjectRef.current.next(isMuted) }, [isMuted])

  
  // bpm state
  const [bpm, setBpm] = useState(128)
  const bpmSubjectRef = useRef(new BehaviorSubject(bpm))
  useEffect(() => { bpmSubjectRef.current.next(bpm) }, [bpm])

  const context = {
    isPlaying,
    setIsPlaying,
    isPaused,
    setIsPaused,
    isRecording,
    setIsRecording,
    isMuted,
    setIsMuted,
    bpm,
    setBpm,
    observables: {
      isPlaying: isPlayingSubjectRef.current,
      isPaused: isPausedSubjectRef.current,
      isRecording: isRecordingSubjectRef.current,
      isMuted: isMutedSubjectRef.current,
      bpm: bpmSubjectRef.current,
    }
  }
  
  return (
    <TransportContext.Provider value={context}>
      {props.children}
    </TransportContext.Provider>
  )
}
