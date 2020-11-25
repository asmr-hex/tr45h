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
  SubBeatSequence,
  Choice,
  choose
} from './types'
import {
  EndOfSequence,
  SyntaxError,
} from './error'


// look at this JSON parser in js https://wesleytsai.io/2015/06/13/a-json-parser/
// look at this https://blog.mgechev.com/2017/09/16/developing-simple-interpreter-transpiler-compiler-tutorial/


/**
 * Parser constructs a Concrete Syntax Tree for input token arrays.
 *
 * @description the Lexer output is the input to the parser. While the lexer handles and recovers
 * from lexical errors (such as parentheses balancing/mismatches), it is the role of the parser to
 * handle and recover from semantic errors by analyzing the arrangement of the provided tokens. In
 * particular, the usage and placement of identifiers (is it a function or sound word literal or a 
 * number?)
 * 
 */
export class Parser {
  constructor(symbolTable, options = {}) {
    this.symbolTable = symbolTable
    this.tokens = []
    this.errors = []
    this.tokenIndex = 0
    this.options = {
      choiceFn: choose,
      ...options,
    }
  }

  setTokens({ tokens, errors }) {
    this.tokens = tokens
    this.errors = errors
    this.tokenIndex = 0
  }

  peek() {
    return this.tokens[this.tokenIndex]
  }
  consume() { return this.tokens[this.tokenIndex++] }
  
  /**
   * recursive descent parser
   */
  analyze(tokenizedBlocks) {
    return this.program(tokenizedBlocks)
  }

  analyzeStatement(tokenizedBlock) {
    return this.statement(tokenizedBlock)
  }

  /**
   * program is the RD parser function for the <program> nonterminal.
   *
   * @param {Array<Array<token>>} input an array of arrays of tokens (corresponding to each line of code).
   * @return {?} the parse tree for th entire program.
   */
  program(tokenizedBlocks) {
    return this.statements(tokenizedBlocks)
  }

  /**
   * statements is the RD parser function for the <stmts> nonterminal.
   *
   * @param {Array<Array<token>>} input an array of arrays of tokens (corresponding to each line of code).
   * @return {?} the parse tree for all statements.
   */
  statements(tokenizedBlocks) {
    return map(
      tokenizedBlocks,
      tokens => {
        return this.statement(tokens)
      }
    ).filter(s => s !== null)
  }

  /**
   * statements is the RD parser function for the <stmt> nonterminal.
   *
   * @return {?} the parse tree for a statement.
   */
  statement(tokens) {
    this.setTokens(tokens)
    return this.sequence()
  }

  /**
   * sequence is the RD parser function for the <seq> nonterminal.
   *
   * @return {?} the parse tree for a sequence.
   */
  sequence() {
    const steps = this.steps()
    return steps.length !== 0 ? new Sequence(steps) : null
  }

  subbeat() {
    const steps = this.steps()
    return steps.length !== 0 ? new SubBeatSequence(steps) : null
  }

  steps(limit = 0) {
    let steps = []
    try {
      while (this.peek()) {

        // optionally limit the number of steps we parse
        if (limit > 0) {
          if (steps.length === limit) return steps
        }
        
        switch(this.peek().type) {
        case 'IDENTIFIER':
          steps.push(this.sound())
          break
        case 'SEPARATOR':
          const v = this.separator()
          if (v !== null) steps.push(v)
          break
        case 'OPERATOR':
          if (steps.length === 0) throw new SyntaxError(`Unexpected '${this.peek().value}' operator placement!`)
          steps.push(this.operator(steps.pop()))
          break
        case 'COMMENT':
          this.consume()
          break
        default:
          throw new SyntaxError(`Unkown Symbol '${this.peek().type}'`)
        }
      } 
    } catch (e) {
      if (e instanceof EndOfSequence) return steps
      throw e
    }
    
    return steps
  }

  choice(lhs) {
    let choices = [lhs]
    let probabilities = []
    try {
      while (this.peek()) {
        choices.push(...this.steps(1))
        if (this.peek().value === '|') { this.consume() }
        else { throw new EndOfSequence() }
      }
    } catch (e) {
      if (!e instanceof EndOfSequence) throw e
    }

    // TODO calculate probabilities
    probabilities = map(choices, i => 1/choices.length)
    
    return new Choice(choices, probabilities, this.options.choiceFn)
  }
  
  operator(lhs) {
    switch (this.peek().value) {
    case '|':
      this.consume()
      return this.choice(lhs)
    }
  }
  
  separator() {
    switch(this.peek().value) {
    case '(':
      this.consume()
      return this.sequence()
    case '[':
      this.consume()
      return this.subbeat()
    case ')':
    case ']':
      this.consume()
      throw new EndOfSequence()
    }
  }

  sound() {
    switch (this.peek().type) {
    case 'IDENTIFIER':
      const token = this.consume()
      this.symbolTable.merge({identifier: token.value, type: 'sound'})
      return new Terminal({type: 'sound', value: token.value, fx: [], ppqn: 1, id: `${token.block}-token${token.start}` })
    default:
      throw new Error("aaaaa")
    }
  }
}
