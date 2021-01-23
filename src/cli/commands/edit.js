import React from 'react'

import { Command } from './command'
import { Parameter } from './parameters'
import { ParameterTypes } from './types'

// import { SoundPage } from '../../ui/dialogs/sound'

// edit <sound>|<collection>|project
export class Edit extends Command {
  constructor() {
    super({
      name: 'edit',
      aliases: ['show'],
      description: `show or edit a sound, collection, or project`,
      params: [
        new Parameter({
          types: [ ParameterTypes.Sound, ParameterTypes.Collection ],
          optional: false,
        })
      ],
      subcommands: [
        new EditProject(),
      ],
    })
  }

  getExecutable(context) {
    // TODO memoize command list and transfomration.
    const { commands, info } = context
    
    return () => {
      const name = info
      return props => <div>editing</div>
    }
  }
}

export class EditProject extends Command {
  constructor() {
    super({
      name:        'project',
      aliases:     [],
      params:      [],
      subcommands: [],
    })
  }

  getExecutable(context) {
    return () => {
      return props => <div>project page</div>
    }
  }
}
