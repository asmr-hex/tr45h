import { useEffect, useState, useContext } from 'react'
import { reduce } from 'lodash'
import context from './context/audio'
import { useSequenceContext } from './context/sequence'
import { Scheduler } from './scheduler'


export const Sequencer = props => {
  const {audioContext} = useContext(context)
  const { sequenceState } = useSequenceContext()
  const [ scheduler, setScheduler ] = useState(null)

  // useEffect(() => {
  //   const scheduler = new Scheduler(audioContext)
  //   scheduler.start()
  //   setScheduler(scheduler)

  //   return () => scheduler.stop()
  // }, [])

  useEffect(() => {
    if (scheduler) {
      scheduler.setSequences(reduce(sequenceState.sequences, (acc, v) => ({...acc, [v.key]: v.steps}), {}))
      scheduler.setSoundMap(sequenceState.sounds) 
    }
  }, [sequenceState])
  
  return null
}
