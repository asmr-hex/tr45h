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

  peek(skip=0) {
    return this.tokenIndex + skip <= this.tokens.length
      ? this.tokens[this.tokenIndex + skip]
      : null
  }
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
          result = this.identifier()
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
          this.consume()
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
   * @description could be a sound or a variable
   */
  identifier() {
    // we know this is an identifier. we need to figure out if this is a
    // variable or a sound

    // okay assume this is a sound for now
    return this.sound()
  }

  // we need to figure out if the sound has query parameters
  sound() {
    // capture the sound token
    const token = this.consume()

    const hasQueryParameters =
          this.peek() &&
          this.peek().value === '(' &&
          this.peek(1) &&
          this.peek(1).type === 'IDENTIFIER' &&
          this.symbolTable.isQueryParameter(this.peek(1).value)
          
    // does it have query parameters?
    // TODO make return type of fnArgs correct! (tree and errors)
    const parameters = hasQueryParameters ? this.fnArgs('_soundFn') : {}

    // convert parameters into unique string
    const paraStr = reduce(
      parameters.parameters,
      (acc, v, k) => `${acc}${k}:${v}::`,
      '::'
    )

    const symbol = {
      id: `${token.value}${paraStr}`,
      identifier: `${token.value}`,
      type: 'sound',
      meta: {
        parameters: parameters.parameters,
      }
    }
    this.symbolTable.merge(symbol)
    
    return {
      tree: new Terminal({type: 'sound', value: symbol.id, parameters, fx: [], ppqn: 1, id: `${token.block}-token${token.start}` }),
      errors: [],
    }
  }

  fnArgs(fnName) {
    // create a parameter map
    let parameters = {}

    // get available parameters from symbol table
    const fnDetails = this.symbolTable.get(fnName)
    
    // pop off the left-parenthesis
    this.consume()

    // get starting position
    const start = this.peek().start

    let errors = []
    let errorTokens = []

    // loop over all parameters until we can't no more
    while (this.peek() && this.peek().value !== ')') {
      // get the next parameter in the list
      const paramName = this.consume()

      if (errors.length !== 0) continue
      
      // is this a supported parameter name?
      if (!(paramName.value in fnDetails.meta.parameters) ) {
        errors.push(new Error("unsupported parameter"))
        continue
      }
      
      // okay this is a valid argument

      // is this a boolean flag parameter?
      if (fnDetails.meta.parameters[paramName.value].isFlag) {
        parameters = {
          ...parameters,
          ...fnDetails.meta.parameters[paramName.value].translate()  
        }

        // if there is a comma, pop that off!
        if (this.peek() && this.peek().value === ',') this.consume()
        
        continue
      }

      // okay this must be a keyword parameter with a value

      // is there a colon separator?
      if (this.peek() && this.peek().value !== ':') {
        errors.push(new Error("expected a ':' for keyword argument"))
        continue
      }
      
      // pop off :
      this.consume()

      // okay lets get the value (can be multiple tokens)
      let valueTokens = []
      while (this.peek() && this.peek().value !== ',' && this.peek().value !== ')') {
        valueTokens.push(this.consume())
      }

      // yo, lets translate this shit
      parameters = {
        ...parameters,
        ...fnDetails.meta.parameters[paramName.value].translate(valueTokens)  
      }

      // if there is a comma, pop that off!
      if (this.peek() && this.peek().value === ',') this.consume()
    }

    const end = start + this.peek().length
    
    // pop off right-parenthesis
    this.consume()

    console.log("====")
    console.log(errors)
    console.log(parameters)
    
    return {
      errors,
      parameters,
    }
  }
}
