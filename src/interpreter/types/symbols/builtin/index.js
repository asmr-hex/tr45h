import { reduce } from 'lodash'

import { Volume } from './volume'
import { Reverb } from './reverb'

import { SoundQuery } from './soundQuery'


const functions = [
  Volume,
  Reverb,
]

/**
 * aggregate builtin symbols by type and id
 */
export const Builtin = {
  functions: reduce(functions, (acc, f) => ({...acc, [f.id]: f}), {}),
  variables: {},
  sounds: {},
  query: SoundQuery,
}
