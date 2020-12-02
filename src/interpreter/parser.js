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
 * number?).
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

  peek() { return this.tokens[this.tokenIndex] }
  consume() { return this.tokens[this.tokenIndex++] }
  
  /**
   * analyzes an entire program.
   *
   * @description takes all tokenized statements which constitute a program
   * and analyze them. (see cfg.md for details on grammar).
   *
   * @param {Array<Tokens>} tokenizedStatements an array of tokens corresponding to each statement.
   *
   * @return {ParseResult} a parse result containing detected errors and thre resulting tree.
   */
  analyze(tokenizedStatements) {
    return this.program(tokenizedStatements)
  }

  /**
   * analyzes one statement of a program.
   *
   * @description takes one tokenized statement and analyzes it. (see cfg.md for details on grammar).
   *
   * @param {Tokens} statementTokens tokens of the statement.
   *
   * @return {ParseResult} a parse result containing detected errors and thre resulting tree.
   */
  analyzeStatement(statementTokens) {
    return this.statement(statementTokens)
  }

  /**
   * analyzes an entire program.
   *
   * @description takes all tokenized statements which constitute a program
   * and analyze them. (see cfg.md for details on grammar).
   *
   * @param {Array<Tokens>} tokenizedStatements an array of tokens corresponding to each statement.
   *
   * @return {ParseResult} a parse result containing detected errors and thre resulting tree.
   */
  program(tokenizedStatements) {
    return this.statements(tokenizedStatements)
  }

  /**
   * analyzes an array of statements in a program.
   *
   * @description takes a list of tokenized statements of a program and analyze them.
   * (see cfg.md for details on grammar).
   *
   * @param {Array<Tokens>} tokenizedStatements an array of tokens corresponding to each statement.
   *
   * @return {ParseResult} a parse result containing detected errors and thre resulting tree.
   */
  statements(tokenizedStatements) {
    return reduce(
      tokenizedStatements,
      (acc, tokens) => {
        const parseResult = this.statement(tokens)
        return {
          tree: [...acc.tree, parseResult.tree],
          errors: [parseResult.errors]
        }
      },
      { tree: [], errors: [] },
    )
  }

  /**
   * analyzes one statement of a program.
   *
   * @description takes one tokenized statement and analyzes it. (see cfg.md for details on grammar).
   *
   * @param {Tokens} statementTokens tokens of the statement.
   *
   * @return {ParseResult} a parse result containing detected errors and thre resulting tree.
   */
  statement(statementTokens) {
    this.setTokens(statementTokens)
    return this.sequence()
  }

  /**
   * sequence is the RD parser function for the <seq> nonterminal.
   *
   * @return {?} the parse tree for a sequence.
   */
  sequence() {
    const steps = this.steps()
    const sequence = steps.tree.length !== 0 ? new Sequence(steps.tree) : null
    return {
      tree: sequence,
      errors: steps.errors
    }
  }

  subbeat() {
    const steps = this.steps()
    const subbeat = steps.tree.length !== 0 ? new SubBeatSequence(steps.tree) : null
    return {
      tree: subbeat,
      errors: steps.errors
    }
  }

  steps(limit = 0) {
    let steps = []
    let errors = []
    try {
      while (this.peek()) {

        // optionally limit the number of steps we parse
        if (limit > 0) {
          if (steps.length === limit) return { tree: steps, errors }
        }

        let result
        switch(this.peek().type) {
        case 'IDENTIFIER':
          result = this.sound()
          steps.push(result.tree)
          errors = [...errors, ...result.errors]
          break
        case 'SEPARATOR':
          result = this.separator()
          errors = [...errors, ...result.errors]
          if (result.tree !== null) steps.push(result.tree)
          break
        case 'OPERATOR':
          if (steps.length === 0) {
            // TODO fill in error more...
            errors = [...errors, { reason: new SyntaxError(`Unexpected '${this.peek().value}' operator placement!`) }]

            // TODO how do we recover from this error? how do we proceed?
          }
          result = this.operator(steps.pop())
          if (result.errors.length === 0) {
            steps.push(result.tree)    
          } else {
            errors = [...errors, ...result.errors]    
          }
          break
        case 'COMMENT':
          this.consume()
          break
        default:
          // TODO fill in error more...
          errors = [...errors, { reason: new SyntaxError(`Unkown Symbol '${this.peek().type}'`) }]

          // TODO how do we recover from this error? how do we proceed?
        }
      } 
    } catch (e) {
      if (e instanceof EndOfSequence) return { tree: steps, errors }
      throw e
    }
    
    return { tree: steps, errors }
  }

  choice(lhs) {
    let choices = [lhs]
    let probabilities = []
    let errors = []
    try {
      while (this.peek()) {
        const result = this.steps(1)
        choices.push(...result.tree)
        errors = [...errors, ...result.errors]
        if (this.peek().value === '|') { this.consume() }
        else { throw new EndOfSequence() }
      }
    } catch (e) {
      if (!e instanceof EndOfSequence) throw e
    }

    // TODO calculate probabilities
    probabilities = map(choices, i => 1/choices.length)
    
    return {
      tree: new Choice(choices, probabilities, this.options.choiceFn),
      errors,
    }
  }
  
  operator(lhs) {
    const token = this.peek().value
    switch (token) {
    case '|':
      this.consume()
      return this.choice(lhs)
    default:
      this.consume()
      return {
        tree: null,
        errors: [ new SyntaxError(`We dont' support '${token}' operators yet`) ],
      }
    }
  }
  
  separator() {
    const token = this.peek().value
    switch(token) {
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
    default:
      this.consume()
      return {
        tree: null,
        errors: [ new SyntaxError(`We dont' support '${token}' operators yet`) ],
      }
    }
  }

  /**
   * parses an identifier token.
   *
   * @description could 
   */
  identifier() {
    
  }
  
  sound() {
    switch (this.peek().type) {
    case 'IDENTIFIER':
      const token = this.consume()
      this.symbolTable.merge({identifier: token.value, type: 'sound'})
      return {
        tree: new Terminal({type: 'sound', value: token.value, fx: [], ppqn: 1, id: `${token.block}-token${token.start}` }),
        errors: [],
      }
    default:
      throw new Error("aaaaa")
    }
  }
}
