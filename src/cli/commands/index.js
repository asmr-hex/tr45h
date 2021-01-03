import { Command } from './command'
import { Help } from './help'
import { Settings } from './settings'

const commands = [
  new Help(),
  new Settings(),
]

export class BuiltInCommands extends Command {
  constructor(context) {
    super({
      name:        null,
      aliases:     [],
      args:        [],
      subcommands: commands,
      context: {
        ...context,
        commands,
      },
    })
  }
}

// here is a list of all the actions i've thought of so far
//
// --- collections ---
// list collections
// new collection
// export collection
// delete collection
//
// --- sounds ---
// edit/show sound
// reload sound
// list sounds
// mute sound(s)
// unmute sound(s)
// solo sound(s)
// unsolo sound(s)
// toggle mute sound (keybinding only)
// toggle solo sound (keybinding only)
// save sound to collection
// delete sound from collection
//
// --- line ---
// mute/unmute line
// solo/unsolo line
//
// --- transport ---
// start
// pause
// stop
// record
//
// --- project ---
// save project
// export project
// load project
// list projects
//
// --- meta ---
// help
// list commands
// about
// settings


// looks like we could probably group these commands like
//
// help
// about
// settings
//
// show colections|sounds|commands|projects
// edit <sound>|<collection>
// open <project>
// save project|<sound>
// export project|<collection>|<sound>
//
// swap <sound>
// mute <sound>
// solo <sound>
