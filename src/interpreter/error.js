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

