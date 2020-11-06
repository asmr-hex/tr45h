import { map, includes } from 'lodash'
import {
  Terminals,
  NonTerminals,
  ContextFreeGrammar,
  hasCycles,
  firstSet,
} from './cfg'


// look at this JSON parser in js https://wesleytsai.io/2015/06/13/a-json-parser/

export class Parser {
  constructor(cfg) {
    // verify that cfg doesn't have cycles
    if (hasCycles(cfg)) throw new Error('CFG contains cycles')

    this.cst = {}
    
    // construct parser functions from cfg (by hand right now)
    this.parsers = this.generateParsers()
  }

  generateParsers() {
    return {
      [NonTerminals.program]: () => {
        if (includes(firstSet(NonTerminals.statements, ContextFreeGrammar), this.lookAhead)) {
          this.parsers[NonTerminals.statements]()
        } else {
          // error
        }
      },
      
    }
  }
  
  /**
   * recursive descent parser
   */
  parse() {
    
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
  statement(input) {
    return this.sequence(input)
  }

  /**
   * sequence is the RD parser function for the <seq> nonterminal.
   *
   * @param {Array<token>} input an array of tokens (corresponding to a line of code).
   * @return {?} the parse tree for a sequence.
   */
  sequence(input) {
    
  }
}
