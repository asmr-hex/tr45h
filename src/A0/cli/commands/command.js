import { reduce, values } from 'lodash'

import { NotImplementedError } from 'A0/lang/types'
import { TokenTypes } from './types' // TODO somehow merge these cli types with lang types?


export class Command {
  constructor({name, aliases, description, params, subcommands, context}) {
    this.name        = name        || ''
    this.aliases     = aliases     || []
    this.description = description || ''
    this.params      = params      || []
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
    
    this.requiredParams = this.params.filter(p => !p.optional)
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
      if (this.requiredParams.length === 0) {
        // no mo required arguments, this is a string of commands
        return {
          command: this.getExecutable(this.context),
          tokens: tokens.map(t => ({...t, type: TokenTypes.Command }))
        }
      } else {
        // ERROR
        return {
          command: null,
          tokens: tokens.map(t => ({...t, type: TokenTypes.Error }))
        }
      }
    }

    const token = tokens[index]

    // are there required arguments?
    if (this.requiredParams.length !== 0) {
      // is the next token an argument?
      if (this.isValidArgument(token)) {
        // validate the argument
        // TODO parse lists of arguments
        console.log("VALID ARGUMENT!")
        tokens[index].type = TokenTypes.Sound
        return {
          command: this.getExecutable([token], this.context),
          tokens: tokens,
        }
      } else {
        // ERROR
        console.log("ERROR (OR A SUB COMMAND WE NEED TO CHECK FURTHER)")
      }
    } else {
      // is the next token a subcommand?
      if (token.value in this.subcommands) {
        // okay parse it further.
        tokens[index].type = TokenTypes.Command
        return this.subcommands[token.value].parse(tokens, index+1)
      } 
    }

    tokens[index].type = TokenTypes.Error
    return {
      command: null,
      tokens: tokens,
    }
  }

  isValidArgument(token) {
    for (const param of this.params) {
      if (param.check(token, this.context)) return true
    }
    return false
  }
  
  getExecutable(args, context) { throw new NotImplementedError('getExecutable()') }
}


// we want to be able to have sub-commands and arguments.
// if the arguments are non-optional and there are subcommands,
// we want to check amongst all of them.

