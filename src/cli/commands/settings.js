import React from 'react'

import { Command, CLIArg } from './command'
import { CLIArgTypes } from './types'

import { SettingsPage } from '../../ui/dialogs/settings'


export class Settings extends Command {
  constructor() {
    super({
      name: 'settings',
      aliases: [],
      args: [
        new CLIArg({
          types: [ CLIArgTypes.Command, CLIArgTypes.Sound ],
          optional: true
        })
      ],
      subcommands: [
        new SoundSettings(),
        new UISettings(),
        new AdvancedSettings(),
        new EditorSettings(),
      ],
    })
  }

  getExecutable(context) {
    // TODO memoize command list and transfomration.
    const { commands, info } = context
    
    return () => {
      const name = info
      return props => <SettingsPage name={name} commands={commands} props={props}/>
    }
  }
}

export class SoundSettings extends Command {
  constructor() {
    super({
      name:        'sound',
      aliases:     [],
      args:        [],
      subcommands: [],
    })
  }
}

export class UISettings extends Command {
  constructor() {
    super({
      name:        'ui',
      aliases:     [],
      args:        [],
      subcommands: [],
    })
  }
}

export class AdvancedSettings extends Command {
  constructor() {
    super({
      name:        'advanced',
      aliases:     [],
      args:        [],
      subcommands: [],
    })
  }
}

export class EditorSettings extends Command {
  constructor() {
    super({
      name:        'editor',
      aliases:     [],
      args:        [],
      subcommands: [],
    })
  }
}
