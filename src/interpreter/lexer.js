

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
  tokenize(input) {
    this.reset()
    this.input = input

    while (this.index < input.length) {
      this.char = this.input[this.index]

      if (this.isWhiteSpace(this.char)) {
        this.advance()
      }
      else if (this.isComment(this.char)) {
        let comment = this.input.substring(this.index, this.input.length)
        const start = this.index
        this.addToken({
          type: 'COMMENT',
          value: comment,
          start,
          end: this.input.length - 1
        })
        this.index = this.input.length
      }
      else if (this.isSeparator(this.char)) {
        this.addToken({
          type: 'SEPARATOR',
          value: this.char,
          start: this.index,
          end: this.index,
        })
        this.advance()
      }
      else if (this.isOperator(this.char)) {
        this.addToken({
          type: 'OPERATOR',
          value: this.char,
          start: this.index,
          end: this.index,
        })
        this.advance()
      }
      else if (this.isDigit(this.char)) {
        let num = this.char
        const start = this.index
        while (this.isDigit(this.advance())) num += this.char
        if (this.char === '.') {
          num += this.char
          while (this.isDigit(this.advance())) num += this.char
        }
        num = parseFloat(num)
        this.addToken({
          type: 'NUMBER',
          value: num,
          start,
          end: this.index - 1,
        })
      }
      else if (this.isIdentifier(this.char)) {
        let identifier = this.char
        const start = this.index
        while (this.isIdentifier(this.advance())) identifier += this.char
        this.addToken({
          type: 'IDENTIFIER',
          value: identifier,
          start,
          end: this.index - 1
        })
      } else {
        // handle errors somehow
      }
    }

    return this.tokens
  }

  advance() { return this.char = this.input[++this.index] }
  addToken(token) { this.tokens.push(token) }

  isWhiteSpace(c) { return /\s/.test(c) }
  isSeparator(c) { return /[\[\]\(\)\{\}\'\"\,]/.test(c) }
  isOperator(c) { return /[\|\.\=]/.test(c) }
  isComment(c) { return /[\#]/.test(c) }
  isDigit(c) { return /[0-9]/.test(c) }
  // since identifiers can have digits in the name, we don't check for non-digitness
  isIdentifier(c) { return typeof c === 'string' && !this.isWhiteSpace(c) && !this.isSeparator(c) && !this.isOperator(c)}
}
