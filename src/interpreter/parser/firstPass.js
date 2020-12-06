import { v4 as uuid } from 'uuid'
import { reduce } from 'lodash'

import {
  LexicalTokenType,
  SemanticTokenType,
  newSemanticToken,
} from '../types/tokens'



/**
 *
 * Performs a first-pass parse over a stream of lexical tokens.
 *
 * @description
 */
export class FirstPassParser {
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

  getInstanceId(token) {
    return `${token.block}-${token.start}`
  }
  
  advance() { return this.token.stream[++this.token.index] }
  consume() { return this.token.stream[this.token.index++] }
  pushToken(token) { this.result.tokens.push(token) }
  pushError(error) { this.result.errors.push(error) }

  
  ////////////////////
  //                //
  //  TEST METHODS  //
  //                //
  ////////////////////
  
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
  isChainOperator() {
    return this.peek() &&
      this.peek().type === 'OPERATOR' &&
      this.peek().value === '.' &&
      this.peek(-1) &&
      ( /[\)\]]/.test(this.peek(-1).value) ||
        this.peek(-1).type === 'IDENTIFIER'
      ) &&
      this.peek(1) &&
      this.peek(1).type === 'IDENTIFIER' &&
      this.isFn(this.peek(1).value)
  }
  isRepetitionOperator() {
    return this.peek() &&
      // either <IDENTIFIER> ) ] * <NUMBER>
      ( this.peek().type === LexicalTokenType.Operator &&
        this.peek().value === '*' &&
        this.peek(1) &&
        this.peek(1).type === LexicalTokenType.Number &&
        this.peek(-1) &&  // LHS is a sequence or identifier
        ( /[\)\]]/.test(this.peek(-1).value) ||
          this.peek(-1).type === 'IDENTIFIER'
        )
      ) ||
      // or <NUMBER> * ( [ <IDENTIFIER>
      ( this.peek().type === LexicalTokenType.Number &&
        this.peek(1) &&
        this.peek(1).type === LexicalTokenType.Operator &&
        this.peek(1).value === '*' &&
        this.peek(2) &&  // RHS is a sequence or identifier
        ( /[\(\[]/.test(this.peek(2).value) ||
          ( this.peek(1).type === 'IDENTIFIER' &&
            !this.isFn(this.peek(1).value) )
        )
      )
  }
  isVariable(identifier) {
    // check symbol table to see if this is a valid static function.
    return true    
  }
  isFn(identifier) {
    // check symbol table to see if this is a valid static function.
    return true
  }
  isSoundLiteral(identifier) {
    return !this.isFn(identifier) && !this.isVariable(identifier)
  }
  hasQueryParameters() {
    return this.peek() &&
      this.peek().type === 'IDENTIFIER' &&
      this.isSoundLiteral(this.peek().value) &&
      this.hasFnParameters('_soundFn')
  }
  hasFnParameters(fnName) {
    return this.peek(1) &&
      this.peek(1).value === '(' &&
      this.peek(2) &&
      this.symbols.isFnParameter(fnName, this.peek(2).value)
  }


  /////////////////////
  //                 //
  //  PARSE METHODS  //
  //                 //
  /////////////////////
  
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
    
    // we know the structure is <VARIABLE_DECL> =
    this.pushToken({ ...this.consume(), type: 'VARIABLE_DECL' })
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
    // * a sound literal
    // * a sound literal with query parameters

    if (this.isVariable(this.peek().value)) {
      // assign instance id to variable
      this.pushToken({
        ...this.peek(),
        instance: this.getInstanceId(this.consume()),
      })
    } else if (this.isSoundLiteral(this.peek().value)) {
      let params = ''
      // check for query parameters
      if (this.hasQueryParameters()) {
        // parse query parameters
        params = reduce(
          this.parseFnParameters(`_soundFn`),
          (acc, v, k) => `${acc}${acc === '' ? '' : '_'}${k}-${v}`,
          ''
        )
      }

      this.pushToken({
        ...this.peek(),
        type: `SOUND_LITERAL`,
        id: `${this.peek().value.replace(/\s+/g, '_')}__${params}`,  // assign sound literal id (combo of value and query parameters)
        instance: this.getInstanceId(this.consume())                 // assign sound literal instance id
      })

      // TODO merge into symbol table?
      
    } else {
      // error?
    }
    
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
      } else if (this.isChainOperator()) {
        this.parseChainOperator()
      } else if (this.isRepetitionOperator()) {
        this.parseRepetitionOperator()
      } else {
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
  analyze(tokens, blockKey, blockIndex) {
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
