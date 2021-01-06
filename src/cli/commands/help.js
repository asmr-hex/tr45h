import React from 'react'

import { Command, CLIArg } from './command'
import { CLIArgTypes } from './types'

import { HelpPage } from '../../ui/dialogs/help'


export class Help extends Command {
  constructor() {
    super({
      name: 'help',
      aliases: ['?'],
      description: `will display this page. or some other page for specific commands`,
      args: [
        new CLIArg({
          types: [ CLIArgTypes.Command, CLIArgTypes.Sound ],
          optional: true
        })
      ],
      subcommands: [
        new HelpSyntax(),
      ],
    })
  }

  getExecutable(context) {
    // TODO memoize command list and transfomration.
    const { commands, info } = context
    
    return () => {
      const name = info
      return props => <HelpPage name={name} commands={commands} props={props}/>
    }
  }
}

export class HelpSyntax extends Command {
  constructor() {
    super({
      name:        'syntax',
      aliases:     [],
      args:        [],
      subcommands: [],
    })
  }
}
