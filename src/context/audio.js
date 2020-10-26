import { createContext } from 'react'
import './audioMonkeyPatch'

const audioContext = new AudioContext()
const context = createContext({ audioContext })

export default context
