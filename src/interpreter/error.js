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
