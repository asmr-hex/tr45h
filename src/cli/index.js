import { BuiltInCommands } from './commands'


export class CLI {
  constructor(context) {
    // instantiate built-in commands
    this.builtin = {
      commands: new BuiltInCommands({
        ...context,
        info: 'some info...',
      }),
    }
    
    this.command = null
  }

  lex(text) {
    let index = 0
    let char = ''
    let tokens = []
    const advance = () => { return char = text[++index] }
    const peek = () => { return index < text.length ? text[index] : null }

    const isWhiteSpace = c => { return /\s/.test(c) }
    const isIdentifier = c => { return typeof c === 'string' && !isWhiteSpace(c) }

    while (index < text.length) {
      char = text[index]

      if (isWhiteSpace(char)) {
        advance()
      }
      else if ( isIdentifier(char) ) {
        let identifier = char
        const start = index
        while (isIdentifier(advance())) identifier += char
        tokens.push({
          value: identifier,
          start,
          length: identifier.length
        })
      }
    }

    return tokens
  }

  parse(tokens) {
    return this.builtin.commands.parse(tokens)
  }
  
  interpret(input) {
    const { command, tokens } = this.parse(this.lex(input))
    this.command = command
    return tokens
  }

  execute() {
    // check latest parsed command
    if (this.command !== null) return this.command()

    return null
  }
}
