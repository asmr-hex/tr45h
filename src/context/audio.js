import { createContext } from 'react'
import './audioMonkeyPatch'

export const audioContext = new AudioContext()
const context = createContext({ audioContext })

export default context
