import React, { useEffect, useState, useRef, useContext } from 'react'
import { reduce } from 'lodash'
import WaveStream from 'react-wave-stream'
import context from './context/audio'
import { useSequenceContext } from './context/sequence'
import { Scheduler } from './scheduler'


export const Sequencer = props => {
  const {
    isRecording,
    isPlaying,
    isPaused
  } = props

  const [analyzerData, setAnalyzerData] = useState([])
  
  const {audioContext} = useContext(context)
  const { sequenceState, setCurrentStep } = useSequenceContext()
  const [ scheduler, setScheduler ] = useState(null)

  useEffect(() => {
    const scheduler = new Scheduler(audioContext, setCurrentStep, setAnalyzerData, 128)
    scheduler.start()
    setScheduler(scheduler)

    return () => scheduler.stop()
  }, [])

  useEffect(() => {
    if (scheduler) {
      scheduler.setSequences(reduce(sequenceState.sequences, (acc, v) => ({...acc, [v.key]: v.steps}), {}))
      scheduler.setSoundMap(sequenceState.sounds) 
    }
  }, [sequenceState])

  useEffect(() => {
    if (!scheduler) return 
    if (isRecording) {
      if (!isPlaying) scheduler.start()
      scheduler.startRecording()
    } else {
      scheduler.stopRecording()
    }
  }, [isRecording])

  useEffect(() => {
    if (!scheduler) return

    if (isPlaying) {
      scheduler.start()
    } else {
      if (isRecording) scheduler.stopRecording()
      scheduler.stop()
    }
  }, [isPlaying])

  useEffect(() => {
    if (!scheduler) return

    if (isPaused) {
      if (isRecording) scheduler.stopRecording()
      scheduler.pause()
    } else {
      if (isPlaying) scheduler.start()
    }
  }, [isPaused])
  
  return null
  // (
  //   <WaveStream data={Object.values(analyzerData)}/>
  // )
}
