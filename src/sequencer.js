import React, { useEffect, useState, useRef, useContext } from 'react'
import { reduce } from 'lodash'
import WaveStream from 'react-wave-stream'
import context from './context/audio'
import { useSequenceContext } from './context/sequence'
import { Scheduler } from './scheduler'


export const Sequencer = props => {
  const { isRecording } = props

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
    if (isRecording) scheduler.startRecording()
    if (!isRecording) scheduler.stopRecording()
  }, [isRecording])
  
  
  return null
  // (
  //   <WaveStream data={Object.values(analyzerData)}/>
  // )
}
