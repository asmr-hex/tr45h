/**
 * CyclicGrammarError is thrown when a cycle has been detected in a grammar. This
 * implies that the grammar is Left-Recursive.
 */
export class CyclicGrammarError extends Error {
  constructor(nonterminal) {
    super(`Cyclic Grammar Error: ${nonterminal} is Left-Recursive`)
    this.name = 'CyclicGrammarError'
  }
}

/**
 * NotImplementedError is thrown when a method on an abstrat class is not implemented.
 */
export class NotImplementedError extends Error {
  constructor(methodName) {
    super(`Not Implemented Error: ${methodName} is not implemented`)
    this.name = 'NotImplementedError'
  }
}

/**
 * General syntx error
 */
export class SyntaxError extends Error {
  constructor(message) {
    super(`Syntax Error: ${message}`)
    this.name = 'SyntaxError'
  }
}

/**
 * SeparatorBalanceError is thrown when an unbalanced separator is detected.
 */
export class SeparatorBalanceError extends SyntaxError {
  constructor({value, location}) {
    super(`Unbalanced '${value}' (${location})`)
    this.name = 'SeparatorBalanceError'
    this.location = location
  }
}

/**
 * SeparatorMismatchError is thrown when a separator is not closed properly
 */
export class SeparatorMismatchError extends SyntaxError {
  constructor(lSep, rSep) {
    super(`Cannot close '${lSep.value}' (${lSep.location}) with '${rSep.value}' (${rSep.location})`)
    this.name = 'SeparatorMismatchError'
    this.leftSeparator = lSep
    this.rightSeparator = rSep
  }
}

/**
 * get thrown at the end of a sequence.
 */
export class EndOfSequence extends Error {
  constructor() {
    super('End of Sequence')
    this.name = 'EndOfSequence'
  }
}
