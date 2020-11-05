import { map } from 'lodash'


export class Parser {
  constructor(cfg) {
    // construct parser from cfg
    this.parse = this.generateParser(cfg)
  }

  generateParser(cfg) {
    return this.leftFactor(this.eliminateLeftRecursion(cfg))
  }

  /**
   * eliminateLeftRecursion takes a context free grammar and removes all left
   * recursive productions.
   *
   * @description this algorithm is guaranteed to work if the provided grammar
   *   (1) has no cycles, i.e. derivations of the form A +=> A
   *   (2) has no ε-productions, i.e. productions of the form A -> ε
   * see the dragon book, section 4.3 for more details.
   *
   * @param {Map<NonTerminals, Array<Array<NonTerminals|Terminals>>>} cfg potentially left-recursive grammar.
   */
  eliminateLeftRecursion(cfg) {
    // TODO
  }

  leftFactor(cfg) {
    // TODO
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
