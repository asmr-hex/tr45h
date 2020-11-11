import { map, reduce, range, includes } from 'lodash'
import {
  Terminals,
  NonTerminals,
  ContextFreeGrammar,
  hasCycles,
  firstSet,
} from './cfg'
import {
  Terminal,
  Sequence,
  Choice
} from './types'


// look at this JSON parser in js https://wesleytsai.io/2015/06/13/a-json-parser/
// look at this https://blog.mgechev.com/2017/09/16/developing-simple-interpreter-transpiler-compiler-tutorial/

export class Parser {
  constructor() {
    this.tokens = []
    this.tokenIndex = 0
  }

  setTokens(tokens) {
    this.tokens = tokens
    this.tokenIndex = 0
  }

  peek() { return this.tokens[this.tokenIndex] }
  consume() { return this.tokens[this.tokenIndex++] }
  
  /**
   * recursive descent parser
   */
  analyze() {
    return this.statement()
  }

  /**
   * program is the RD parser function for the <program> nonterminal.
   *
   * @param {Array<Array<token>>} input an array of arrays of tokens (corresponding to each line of code).
   * @return {?} the parse tree for th entire program.
   */
  program(input) {
    this.cst = {}
    return this.statements(input)
  }

  /**
   * statements is the RD parser function for the <stmts> nonterminal.
   *
   * @param {Array<Array<token>>} input an array of arrays of tokens (corresponding to each line of code).
   * @return {?} the parse tree for all statements.
   */
  statements(input) {
    return map(
      input,
      tokens => this.statement(tokens)
    )
  }

  /**
   * statements is the RD parser function for the <stmt> nonterminal.
   *
   * @param {Array<token>} input an array of tokens (corresponding to a line of code).
   * @return {?} the parse tree for a statement.
   */
  statement() {
    return this.sequence()
  }

  /**
   * sequence is the RD parser function for the <seq> nonterminal.
   *
   * @param {Array<token>} input an array of tokens (corresponding to a line of code).
   * @return {?} the parse tree for a sequence.
   */
  sequence() {
    let steps = []
    while (this.peek()) {
      switch(this.peek().type) {
      case 'QUOTE':
      case 'IDENTIFIER':
        steps.push(this.sound())
        break
      case 'SEPARATOR':
        steps.push(this.separator())
        break
      default:
        throw new Error("fukc")
      }
    }

    // initialize a new sequence
    return new Sequence(steps)
  }

  separator() {
    switch(this.peek().value) {
    case '[':
    case ']':
      return this.subbeat()
    }
  }

  subbeat() {
    switch (this.peek().value) {
    case '[':
      return this.sequence()
    case ']':
    default:
    }
  }
  
  sound() {
    switch (this.peek().type) {
    case 'IDENTIFIER':
      return new Terminal({type: 'sound', value: this.consume().value, fx: [], ppqn: 1 })
    case 'QUOTE':
      return this.soundPhrase()
    default:
      throw new Error("aaaaa")
    }
  }

  soundPhrase() {
    let words = ``
    const quoteType = this.peek().value
    let lastStopIndex = this.consume().end
    while (this.peek()) {
      const spaces = reduce(range(this.peek().start - lastStopIndex - 1), acc => acc + " ", "")
      if (this.peek().value !== quoteType) {
        lastStopIndex = this.peek().end
        words = `${words}${spaces}${this.consume().value}`
      } else {
        this.consume()
        return new Terminal({type: 'sound', value: `${words}${spaces}`, fx: [], ppqn: 1 })  
      }
    }

    throw new Error("unbalanced quotes!")
  }
}
