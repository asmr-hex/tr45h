import { v4 as uuid } from 'uuid'


export class SyntaxHighlighter {
  constructor(symbols) {
    this.symbols = symbols

    this.token = { stream: [], index: null }
    this.block = { key: null, index: null }
    this.result = { tokens: [], errors: [] }
  }

  reset({ tokens, errors }, key, index) {
    this.token = { stream: tokens, index: 0}
    this.block = { key, index }
    this.result = { tokens: [], errors }
  }

  peek(skipAhead = 0) {
    const at = this.token.index + skipAhead
    return at <= (this.token.stream.length - 1) && at >= 0
      ? this.token.stream[at]
      : null
  }

  getLastTokenEnd() {
    const last = this.result.tokens[this.result.tokens.length - 1]
    return last.start + last.length
  }
  
  advance() { return this.token.stream[++this.token.index] }
  consume() { return this.token.stream[this.token.index++] }
  pushToken(token) { this.result.tokens.push(token) }
  pushError(error) { this.result.errors.push(error) }

  // determine the beginnings of expression types
  isAssignment() {
    return this.peek() &&
      this.peek().type === 'IDENTIFIER' &&
      this.peek(1) &&
      this.peek(1).type === 'OPERATOR' &&
      this.peek(1).value === '='
  }
  isSequence() {
    return this.peek() &&
      ( this.peek().type === 'IDENTIFIER' ||
        /[\(\[]/.test(this.peek().value) )
  }
  isComment() {
    return this.peek() &&
    this.peek().type === 'COMMENT'
  }
  isNumber() {
    return this.peek() &&
      this.peek().type === 'NUMBER'
  }
  isHz() {
    return this.peek() &&
      this.peek().type === 'HZ' &&
      this.peek(1) &&
      this.peek(1).type === 'HZ_UNIT'
  }
  isChoice() {
    return this.peek() &&
      this.peek().value === '|' &&
      this.peek(-1) &&
      ( this.peek(-1).type === 'IDENTIFIER' ||
        /[\)\]]/.test(this.peek(-1))
      ) &&
      this.peek(1) &&
      ( this.peek(1).type === 'IDENTIFIER' ||
        /[\(\[]/.test(this.peek(1))
      )
  }
  isChoiceParameter() {
    return this.peek() &&
      this.peek().value === '(' &&
      this.peek(1) &&
      this.peek(1).type === 'NUMBER' &&
      this.peek(2) &&
      this.peek(2).value === ')'
  }

  parseEndOfStatement() {
    if (this.peek() !== null) {
      if (this.peek().type === 'COMMENT') {
        this.pushToken(this.consume())
        return
      }
      
      const endToken = this.token.stream[this.token.stream.length - 1]
      const end = endToken.start + endToken.length
      this.pushError({ type: 'ERROR', start: this.peek().start, length: end - this.peek().start, reasons: [], block: this.block.key})
    }
  }
  
  parseAssignment() {
    const start = this.peek().start
    
    // we know the structure is <VARIABLE> =
    this.pushToken({ ...this.consume(), type: 'VARIABLE' })
    this.pushToken(this.consume())

    // we can assign sequences or function chains or numbers
    if (this.isNumber()) {
      this.pushToken(this.consume())

      this.parseEndOfStatement()
    } else if (this.isHz()) {
      this.pushToken(this.consume())
      this.pushToken(this.consume())
      
      this.parseEndOfStatement()
    } else if (this.isSequence()) {
      this.parseSequence()
    } else {
      const end = this.getLastTokenEnd()
      this.pushError({ type: 'ERROR', start, length: end - start, reasons: [], block: this.block.key})
    }
  }

  parseIdentifier() {
    // so this could be a
    // * variable
    // * a variable with function chaining
    // * a sound literal
    // * a sound literal with query parameters
    // * a sound literal with function chaining
    // check for function chaining after identifier resolution

    if (this.isVariable()) {
      
    } else if (this.isSoundLiteral()) {
      // check for query parameters
      if (this.hasQueryParameters()) {
        
      }
    }

    // check for function chaining
    
    this.pushToken(this.consume())
  }

  parseChoice() {
    // we know the structure should be
    // | <IDENTIFIER> or | ( or | [

    while (this.peek() && this.isChoice()) {
      // pop off the choice operator
      this.pushToken(this.consume())

      if (this.isChoiceParameter()) {
        // pop off left paren, number, & right paren
        this.pushToken(this.consume()) // left paren
        this.pushToken(this.consume()) // number
        this.pushToken(this.consume()) // right paren
      }

      if (this.isSequence()) {
        this.parseSequence()
      } else {
        this.parseEndOfStatement()
        return
      }
    }
  }
  
  parseSequence() {

    // we know the structure should be either
    // <IDENTIFIER> or ( or [

    // if ( or [, lets pop them off (synce lexical analysis ensures they are balanced properly)
    if (/[\(\[]/.test(this.peek().value)) this.pushToken(this.consume())

    // iterate over steps
    while(this.peek() && !/[\)\]]/.test(this.peek().value)) {
      if (this.peek().type === 'IDENTIFIER') {
        this.parseIdentifier()
      } else if (this.isSequence()) {
        this.parseSequence()
      } else if (this.isChoice()) {
        this.parseChoice()
      }
      else {
        this.parseEndOfStatement()
        return
      }
    }

    // pop off right separator if necessary
    if (this.peek() && /[\)\]]/.test(this.peek().value)) this.pushToken(this.consume())
  }

  // the point of this isn't to create a parse tree, but rather augment tokens from
  // lexical analysis with more specific types and report semantic/type errors.
  // in other words, this needs to be fast and not concerned with creating a tree.
  parseStatementTokens(tokens, blockKey, blockIndex) {
    this.reset(tokens, blockKey, blockIndex)

    // there are three kinds of statements: (1) sequence (2) assignment (3) comments
    if (this.isAssignment()) {
      this.parseAssignment()
    } else if (this.isSequence()) {
      this.parseSequence()
    } else {
      this.parseEndOfStatement()
    }
    
    return this.result
  }
}
