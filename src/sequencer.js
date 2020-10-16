import React, { useEffect, useState, useContext } from 'react'
import { map } from 'lodash'
import context from './context/audio'
import { useSequenceContext } from './context/sequence'
import { Voice } from './voice'

const BPM = 128

const Sequence = props => {
  const { steps, tick } = props
  const stepIndex = (tick % steps.length + steps.length) % steps.length
  return (
    <div>
      {
        map(
          steps,
          (v, index) => <Voice name={v} index={index} stepIndex={stepIndex} key={`${v}-${index}`}/>
        )
      }
    </div>
  )
}

const Metronome = props => {
  const { on } = props
  const color = "white"
  const size = "30px"
  return (
    <div style={{display: 'flex', width: '100%'}}>
      <div style={{width: size, height: size, backgroundColor: color, opacity: on ? 0 : 1}}></div>
      <div style={{width: size, height: size, backgroundColor: color, opacity: !on ? 0 : 1}}></div>
    </div>
  )
}

export const Sequencer = props => {
  const {audioContext} = useContext(context)
  const { sequenceState } = useSequenceContext()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(tick => tick + 1);
    }, 60000/BPM);

    return () => {
      clearInterval(interval);
    };
  }, []);
  
  return (
    <div>
      <Metronome on={(tick % 2 + 2) % 2}/>
      {tick}
      {
        map(
          sequenceState.sequences,
          (v, k) => <Sequence {...{...v, tick}}/>
        )
      }
    </div>
  )
}
