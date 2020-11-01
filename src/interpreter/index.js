import { Lexer } from './lexer.js'

export const interpret = str => {
  const lexer = new Lexer()
  const lexed = lexer.lex(str)
  
  return ["hi"]
}
