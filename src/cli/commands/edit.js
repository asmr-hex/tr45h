import React from 'react'

import { Command, CLIArg } from './command'
import { CLIArgTypes } from './types'

import { SoundPage } from '../../ui/dialogs/sound'


export class Edit extends Command {
  constructor() {
    super({
      name: 'edit',
      aliases: ['show'],
      description: `show or edit a sound, collection, or project`,
      args: [
        new CLIArg({
          types: [ CLIArgTypes.Sound ],
          optional: false
        })
      ],
      subcommands: [
        new EditSound(),
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

export class EditSound extends Command {
  constructor() {
    super({
      name:        'someSound',
      aliases:     [],
      args:        [],
      subcommands: [],
    })
  }
}
