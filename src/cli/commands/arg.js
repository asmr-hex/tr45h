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
export class CLIArg {
  constructor({ types, optional }) {
    this.types    = types    || []
    this.optional = optional || true
  }

  check(argument){}
}

const ArgTypeChecker = {
  [CliArgTypes.Sound]: (arg, {symbols}) =>
    !(arg instanceof Array) &&
    ( symbols.isSound(arg.value) || symbols.isVariable(arg.value)),
  [CliArgTypes.Sounds]: (args, {symbols}) =>
    (args instanceof Array)
    ? args.map(arg => symbols.isSound(arg.value) || symbols.isVariable(arg.value))
    : false,
  [CliArgTypes.Line]: (arg, {somethingThatKeepsTrackOfLines}) => false,
  [CliArgTypes.Lines]: (arg, {ditto}) => false,
  [CliArgTypes.Collection]: (arg, {collectionManager}) => false,
  [CliArgTypes.Collections]: (arg, {collectionManager}) => false,
  [CliArgTypes.Project]: (arg, {projectManager}) => false,
  [CliArgTypes.Projects]: (arg, {projectManager}) => false,
  [CliArgTypes.Command]: (arg, {cli}) => false,
}

export class CommandParams {
  constructor({ types, optional }) {
    this.types    = types    || []
    this.optional = optional || true
  }

  check(arguments, context) {
    let potentialTypes = []
    for (const type of this.types) {
      if (ArgTypeChecker[type](arguments, context))
        potentialTypes.push(type)
    }

    // TODO if there are more than one potential types, then we need to disambiguate

    // return the type
  }
}
