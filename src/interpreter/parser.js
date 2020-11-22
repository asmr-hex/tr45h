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

  peek() { return this.tokens[this.tokenIndex] }
  consume() { return this.tokens[this.tokenIndex++] }
  
  /**
   * recursive descent parser
   */
  analyze(tokenizedBlocks) {
    return this.program(tokenizedBlocks)
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
        this.setTokens(tokens)
        return this.statement()
      }
    )
  }

  /**
   * statements is the RD parser function for the <stmt> nonterminal.
   *
   * @return {?} the parse tree for a statement.
   */
  statement() {
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
        case 'QUOTE':
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
      const identifier = this.consume().value
      this.symbolTable.merge({identifier, type: 'sound'})
      return new Terminal({type: 'sound', value: identifier, fx: [], ppqn: 1 })
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
        const identifier = `${words}${spaces}`
        this.symbolTable.merge({identifier, type: 'sound'})
        return new Terminal({type: 'sound', value: identifier, fx: [], ppqn: 1 })  
      }
    }

    throw new Error("unbalanced quotes!")
  }
}
