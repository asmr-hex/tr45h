import React, { useEffect, useState, useContext } from 'react'
import context from './context/audio'
import { useSequenceContext } from './context/sequence'


export const Voice = props => {
  const { index, name, stepIndex } = props
  const { sequenceState: { soundBuffers } } = useSequenceContext()
  const { audioContext } = useContext(context)
  const [bufferNode, setBufferNode] = useState(null)
  const [isAvailable, setIsAvailable] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)


  const createBuffer = async (start = false) => {
    const bufferNode = audioContext.createBufferSource()
    if (bufferNode && soundBuffers[name]) {
      bufferNode.buffer = await audioContext.decodeAudioData(soundBuffers[name].slice(0))
      setIsAvailable(true)
    }
    bufferNode.connect(audioContext.destination)
    setBufferNode(bufferNode)
    if (start) bufferNode.start()
  }
  
  // create initial buffer node
  useEffect(() => {
    createBuffer()
    
    return () => {
      if (bufferNode) {
        try {
          bufferNode.stop()
          bufferNode.disconnect() 
        } catch(err) {
          console.error(err)
        }
      }
    }
  }, [])

  // if the buffer it should use has changed (its been loaded), update it
  useEffect(() => {
    createBuffer()
  }, [soundBuffers])

  useEffect(() => {
      if (index === stepIndex) {
        setIsPlaying(true)
      } else {
        setIsPlaying(false)
      }
  }, [stepIndex, index])

  useEffect(() => {
    if (!bufferNode) return
    if (isPlaying) {
      createBuffer(true)
    } else {
      try{
        bufferNode.stop()  
      } catch(err) {}
    }
  }, [isPlaying])


  
  // this is an invisible component!
  return null
}
