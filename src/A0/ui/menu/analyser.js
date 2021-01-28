import React, { useEffect, useState, useRef } from  'react'
import { withTheme, styled } from "@material-ui/core/styles"

import { useAudio, useRuntime } from '../../state'


const AnalyserRoot = withTheme(styled('div')({
  display: 'flex',
  width: '85%',
  position: 'relative',
}))

export const Analyser = props => {
  const { audioContext } = useAudio()
  const { scheduler }    = useRuntime()
  
  const [buffer, setBuffer] = useState(null)
  const [bufferLength, setBufferLength] = useState(null)
  const ref = useRef(null)
  
  useEffect(() => {
    if (scheduler === null) return

    scheduler.audio.output.analysis.fftSize = 2048
    const bufferLength = scheduler.audio.output.analysis.frequencyBinCount
    setBuffer(new Uint8Array(bufferLength))
    setBufferLength(bufferLength)
  }, [scheduler])

  useEffect(() => {
    if (ref.current === null) return

    const { audio: { output: { analysis } } } = scheduler

    const canvas = ref.current
    const ctx    = canvas.getContext('2d')

    const ratio  = window.devicePixelRatio
    const width  = getComputedStyle(canvas).getPropertyValue('width').slice(0, -2)
    const height = getComputedStyle(canvas).getPropertyValue('height').slice(0, -2)

    canvas.width  = width * ratio
    canvas.height = height * ratio

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    let requestId
    const render = () => {
      analysis.getByteTimeDomainData(buffer)

      // set background color
      ctx.fillStyle = '#434343ff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.lineWidth = 2
      ctx.strokeStyle = 'cornflowerblue'
      ctx.beginPath()
      
      const sliceWidth = canvas.width * (1.0 / bufferLength)
      let x = 0
      for (let i = 0; i < bufferLength; i++) {
        const v = buffer[i] / 128.0
        const y = v * (canvas.height/2)

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      // draw frequency lines
      ctx.lineTo(canvas.width, canvas.height/2)
      ctx.stroke()

      // draw side brackets
      ctx.lineWidth = 1
      ctx.strokeStyle = 'cornflowerblue'
      ctx.beginPath()
      ctx.moveTo(0, (canvas.height/2) * 0.4)
      ctx.lineTo(0, (canvas.height/2) * 1.6)
      ctx.moveTo(canvas.width, (canvas.height/2) * 0.4)
      ctx.lineTo(canvas.width, (canvas.height/2) * 1.6)
      ctx.stroke()
      
      requestId = requestAnimationFrame(render)
    }

    render()

    return () => cancelAnimationFrame(requestId)
  })
  
  if (scheduler === null || buffer === null || bufferLength === null) return <AnalyserRoot/>
  
  const styles = {
    width: '100%',
    // height: '100%',
  }

  return (
    <AnalyserRoot>
      <canvas ref={ref} height={'0px'} style={styles}/>
    </AnalyserRoot>
  )
}
