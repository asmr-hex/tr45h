import { ParameterTypes } from './types'

// types of possible arguments
// sound/variables
// variable (that resolves to a sound or sequence)
// lines
// collection
// project
// command

// PLURAL
// sounds (save to collection, refresh, mute/unmute, solo/unsolo)
// collections (delete, export)
// projects (export)
// lines (mute/unmute, solo/unsolo)
//
// where do we check for these things?
// sounds/variables - symboltable
// lines - idk
// collection ?
// project ?

const ArgTypeChecker = {
  [ParameterTypes.Sound]: (arg, {symbols}) =>
    !(arg instanceof Array) &&
    ( symbols.isSound(arg.value) || symbols.isVariable(arg.value)),
  [ParameterTypes.Sounds]: (args, {symbols}) =>
    (args instanceof Array)
    ? args.map(arg => symbols.isSound(arg.value) || symbols.isVariable(arg.value))
    : false,
  [ParameterTypes.Line]: (arg, {somethingThatKeepsTrackOfLines}) => false,
  [ParameterTypes.Lines]: (arg, {ditto}) => false,
  [ParameterTypes.Collection]: (arg, {collectionManager}) => false,
  [ParameterTypes.Collections]: (arg, {collectionManager}) => false,
  [ParameterTypes.Project]: (arg, {projectManager}) => false,
  [ParameterTypes.Projects]: (arg, {projectManager}) => false,
  [ParameterTypes.Command]: (arg, {cli}) => false,
}

export class Parameter {
  constructor({ types, optional }) {
    this.types    = types    || []
    this.optional = optional || true
  }

  check(args, context) {
    let candidateTypes = []

    // check against each type
    for (const type of this.types) {
      if (ArgTypeChecker[type](args, context))
        candidateTypes.push(type)
    }

    if (candidateTypes.length === 0) return false
    
    // TODO if there are more than one potential types, then we need to disambiguate
    console.log(candidateTypes)
    
    return true
  }
}
