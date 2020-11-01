

export class Lexer {
  constructor() {
    this.reset()
  }

  /**
   * reset sets all appropriate variables to their 0-values to
   * prepare for another lexing pass.
   */
  reset() {
    this.input  = ''
    this.tokens = []
    this.char   = null
    this.index  = 0
  }

  /**
   * lex takes a chunk of code and performs lexical analysis on it
   *
   * @param {string} input  a chunk of code to perform lexical analysis on
   * @return {Array<token>} an array of tokens
   */
  lex(input) {
    this.reset()
    this.input = input

    // while (index < input.length) {
    //   char = input[index]

    
    
    // }    
  }

  advance() { return this.char = this.input[++this.index] }
  addToken(type, value) { this.tokens.push({ type, token })}

  isWhiteSpace(c) { return /\s/.test(c) }
  isSeparator(c) { return /[\[\]\(\)\{\}\'\"]/.test(c)}
  is
  
}
