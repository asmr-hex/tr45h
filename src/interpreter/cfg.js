import { includes, reduce, flatMap, map } from 'lodash'
import { CyclicGrammarError } from './error'



/**
 * SOUND_LITERAL has a buffer and an optional process chain
 * VARIABLE can be bound to an EXPRESSION
 * EXPRESSION can be a 
 */

// statement:
//  * variable assignment
//  * sequence
//
// variable assignment LHS:
//  * fxchain
//  * sequence
//  * function (lfo)
//
// 

// how to left-factor lists....
// https://stackoverflow.com/questions/33987688/looking-for-advice-on-making-this-bnf-grammar-suitable-for-ll1-parsing-left-f
// interesting!

// small start: only support parentheses and beatexpr
// (right now paranthesis do nothing...)
/**
 * <program> := <statements>
 *
 * <statements> := <statement> \n
 *               | <statement> \n <statements>
 *
 * <statement> := <sequence>
 *
 * <sequence> := <sound>
 *             | <sound> <sequence>
 *             | <beatexpr>
 *             | ( <sequence> )
 *
 * <beatexpr> := [ <sequence> ]
 *
 * <sound> := <soundvar>
 *          | " <soundvars> "
 *
 * <soundvars> := <soundvar>
 *              | <soundvar> <soundvars>
 *
 * <soundvar> := <identifier>
 *
 */

// stan has a good reference https://mc-stan.org/docs/2_22/reference-manual/bnf-grammars.html
/**
 * BNF Notation
 *
 * <program> := <statement>
 *            | <statement> <program>
 *
 * <statement> := <identifier> = <expression>
 *              | <expression>
 *
 * <expression> := <sequence>
 *               | <fxchain>
 *
 * <sequence> := <sound>
 *             | <sound> <sequence>
 *             | <beatexpr>
 *             | ( <sequence> )
 *             | <sequence> <or> <sequence>
 *
 * <beatexpr> := [ <sequence> ]
 *
 * <sound> := <identifier>
 *          | <sound> . <fxchain>
 *          | ( <sound> )
 *
 * <fxchain> := <fx>
 *            | <fx> . <fxchain>
 *
 * <fx> := <identifier>
 *       | <identifier> ( <args> )
 *
 * <args> := <num>
 *         | <num> , <args>
 *
 * <or> := '|'
 *       | '|' ( ?<num> )
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * <expression> := 
 *
 * <sequence> := <soundExpression>
 *             | <soundExpression> <sequence>
 * 
 * <soundExpression> := <sound>
 *                    | <sound> . <processorExpression>
 *
 * <processorExpression> := <processor>
 *                        | <processor> . <processorExpression>
 *
 * <soundLiteral> := 
 *
 * <orExpression> := <soundExpression> <orOperator> <soundExpression>
 *                 | 
 *
 * <orOperator> := '|'
 *               | '|' ( <number> )
 *
 * <variableDecl> := <variable> <assignementOperator> <expression>
 *
 * <variable> := <identifier>
 *
 * <identifier> := [a-zA-Z]+ [a-zA-Z0-9_]*
 *
 * <assignmentOperator> := =
 *
 * <number> ::= <int>
 *            | <int> . <int>
 *
 * <int> := [0-9]+
 */

export const SpecialTerminals = {
  epsilon: null,
}

export const NonTerminals = {
  program: 'program',
  statements: 'statements',
  statement: 'statement',
  sequence: 'sequence',
  beatexpr: 'beatexpr',
  sound: 'sound',
  soundvars: 'soundvars',
  soundvar: 'soundvar',
}

export const Terminals = {
  ...SpecialTerminals,
  lparen: /\(/,
  rparen: /\)/,
  lbracket: /\[/,
  rbracket: /\]/,
  quote: /[\"\']/,
  identifier: /^[A-Za-z]+(?:(?!->)[^\s\[\]\(\)\'\"\#\=\.])+$/,
}

export const ContextFreeGrammar = {
  terminals: Terminals,
  nonterminals: NonTerminals,
  bnf: {
    [NonTerminals.program]: [ [ NonTerminals.statements] ],
    [NonTerminals.statements]: [
      [ NonTerminals.statement ],
      [ NonTerminals.statement, NonTerminals.statements ],
    ],
    [NonTerminals.statement]: [ [ NonTerminals.sequence ] ],
    [NonTerminals.sequence]: [
      [ NonTerminals.sound ],
      [ NonTerminals.sound, NonTerminals.sequence ],
      [ NonTerminals.beatexpr ],
      [ Terminals.lparen, NonTerminals.sequence, Terminals.rparen ],
    ],
    [NonTerminals.beatexpr]: [
      [ Terminals.lbracket, NonTerminals.sequence, Terminals.rbracket ],
    ],
    [NonTerminals.sound]: [
      [ NonTerminals.soundvar ],
      [ Terminals.quote, NonTerminals.soundvars, Terminals.quote ],
    ],
    [NonTerminals.soundvars]: [
      [ NonTerminals.soundvar ],
      [ NonTerminals.soundvar, NonTerminals.soundvars ],
    ],
    [NonTerminals.soundvar]: [ [ Terminals.identifier ] ], 
  }
}

/**
 * hasCycles takes a context-free grammar and detects whether it contains cycles.
 *
 * @description cycles ina CFG are defined as derivations of the form A +=> A. These
 * cycles are important to eliminate if we want to use predictive parsing.
 *
 * @param {Map<NonTerminals, Array<Array<NonTerminals|Terminals>>>} cfg potentially cyclic grammar.
 * @return {bool} whether it contains cycles or not.
 */
export const hasCycles = cfg => {
  try {
    return reduce(
      cfg.bnf,
      (acc, productions, lhs) =>
        acc || includes(firstSet(lhs, cfg), lhs),
      false,
    )
  } catch (error) {
    if (error instanceof CyclicGrammarError) return true

    throw error
  }
}


/**
 * firstSet yields the 'first' set of a set of productions.
 *
 * @description the 'first' set of a set of productions is the set containing
 * all the possible first terminals derived from each production. For properly
 * Left-Factored grammars, the resulting 'first' set should contain no duplicate
 * terminals.
 *
 * @param {NonTerminal} nonterminal the name of the NonTerminal for which we wish to derive a 'first' set.
 * @param {Map<NonTerminals,Array<Array<NonTerminals|Terminals>>>} cfg the context-free grammar.
 * @param {Array<NonTerminals>} visited an array of visited nonterminals to detect cycles in recursion.
 *
 * @throws {CyclicGrammarException}
 *
 * @return {Array<Terminals>} an array of Terminals representing all possible first
 *                            tokens derived from all the productions.
 */
export const firstSet = (nonterminal, cfg, visited=[]) => {
  if (includes(visited, nonterminal))
    throw new CyclicGrammarError(nonterminal)
    
  return flatMap(
    cfg.bnf[nonterminal],
    production =>
      isTerminal(production[0], cfg)
      ? [production[0]]
      : firstSet(production[0], cfg, [...visited, nonterminal])
  ) 
}

/**
 * isTerminal takes a symbol and a cfg and determines whether the symbol is a terminal.
 *
 * @param {string} symbol the potentially terminal symbol
 *
 * @param {Map<NonTerminals,Array<Array<NonTerminals|Terminals>>>} cfg the context-free grammar.
 *
 * @return {bool} true if the symbol is a terminal, otherwise false.
 */
export const isTerminal = (symbol, cfg) =>
  includes(cfg.terminals, symbol)



// TODO write algorithm for L-Recursion Elimination
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

// TODO write algorithm for L-Factoring

