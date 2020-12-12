import { reduce } from 'lodash'

import { Volume } from './volume'


const functions = [
  Volume,
]

/**
 * aggregate builtin symbols by type and id
 */
export const Builtin = {
  functions: reduce(functions, (acc, f) => ({...acc, [f.id]: f}), {}),
  variables: {},
  sounds: {},
}
