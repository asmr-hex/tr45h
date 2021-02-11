import { Command } from './command'
import { Help } from './help'
import { Settings } from './settings'
import { Edit } from './edit'

const commands = [
  new Help(),
  new Edit(),
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

  parse(tokens, index=0) {
    if (tokens.length === 0) return { command: null, tokens: []}

    return super.parse(tokens, index)
  }

  addEntriesTo(dictionary, context) {
    dictionary.add(context, [['edit', {sound: ['symbols.sounds']}]])
  }
}


// here is a list of all the actions i've thought of so far
//
// --- collections ---
// list collections
// new collection
// show <collection>
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
// show project
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
// edit <sound>|<collection>|project
// open <project>
// save project|<sound>
// export project|<collection>|<sound>
//
// swap <sound>
// mute <sound>
// solo <sound>
