import { reduce, values } from 'lodash'

import { NotImplementedError } from '../../interpreter/types/error'
import { CLITokenTypes } from './types'
// import { CLIArg } from './arg'


export class Command {
  constructor({name, aliases, description, args, subcommands, context}) {
    this.name        = name        || ''
    this.aliases     = aliases     || []
    this.description = description || ''
    this.args        = args        || []
    this.subcommands = reduce(
      subcommands || [],
      (acc, c) => ({
        ...acc,
        ...reduce(
          [c.name, ...c.aliases],
          (acc1, a) => ({
            ...acc1,
            [a]: c,
          }),
          {}
        )
      }),
      {}
    )
    this.setContext(context || {})
    
    this.requiredArgs = this.args.filter(a => !a.optional)
  }

  setContext(context={}) {
    this.context = context
    if (context === null || context === {}) return
    for (const c of values(this.subcommands)) {
      c.setContext(this.context)
    }
  }
  
  parse(tokens, index=0) {
    // are there no more tokens?
    if (index >= tokens.length) {
      if (this.requiredArgs.length === 0) {
        // no mo required arguments, this is a string of commands
        return {
          command: this.getExecutable(this.context),
          tokens: tokens.map(t => ({...t, type: CLITokenTypes.Command }))
        }
      } else {
        return {
          command: null,
          tokens: tokens.map(t => ({...t, type: CLITokenTypes.Error }))
        }
      }
    }

    const token = tokens[index]

    // are there required arguments?
    if (this.requiredArgs.length !== 0) {
      // is the next token an argument?
      if (this.isArgument(token)) {
        // validate the argument
      } else {
        // ERROR
      }
    } else {
      // is the next token a subcommand?
      if (token.value in this.subcommands) {
        // okay parse it further.
        tokens[index].type = CLITokenTypes.Command
        return this.subcommands[token.value].parse(tokens, index+1)
      } 
    }

    tokens[index].type = CLITokenTypes.Error
    return {
      command: null,
      tokens: tokens,
    }
  }

  isArgument(token) {
    // what type is this?
    // check the argumentTypes -> checker map
    return false
  }
  
  getExecutable(context) { throw new NotImplementedError('getExecutable()') }
}

export class CLIArg {
  constructor({ types, optional }) {
    this.types    = types    || []
    this.optional = optional || true
  }

  check(argument){}
}

