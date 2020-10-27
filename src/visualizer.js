import React, { useEffect, useRef, useState } from 'react'

import { useSequenceContext } from './context/sequence'


export const SequenceVisualizer = props => {
  const {
    sequenceState,
    currentSteps
  } = useSequenceContext()
  const [context, setContext] = useState(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    setContext(canvas.getContext('2d'))
  }, [])

  useEffect(() => {
    if (!context) return
    
    // clear canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)

    for (let i = 0; i < sequenceState.sequences.length; i++) {
      const onStep = currentSteps[sequenceState.sequences[i].key]
      for (let j = 0; j < sequenceState.sequences[i].steps.length; j++) {
        context.strokeStyle = "#FFFFFF"
        if (j === onStep) {
          // set the color
          context.strokeStyle = "#000000"
        }
        // draw something
        const radius = 10
        context.arc(j*2*radius + radius/3, i*(radius) + radius, radius, Math.PI, 0, true)
        context.stroke()
        console.log("AAA")
      }
    }
  }, [currentSteps])
  
  return (
    <div style={{margin: '0px 10px 0px 10px'}}>
      <canvas ref={canvasRef} {...props}/>
    </div>
  )
}
