import {
  hasCycles,
  firstSet,
  isTerminal,
} from './cfg'
import { CyclicGrammarError } from './error'

// test cfg
const terminals = {
  lparen: /\(/,
  rparen: /\)/,
  lbracket: /\[/,
  rbracket: /\]/,
  quote: /[\"\']/,
  identifier: /^[A-Za-z]+(?:(?!->)[^\s\[\]\(\)\'\"\#\=\.])+$/,
}

const nonterminals = {
  S: 'S',
  A: 'A',
  B: 'B',
  C: 'C',
  D: 'D',
}

const cfg = {
  terminals,
  nonterminals,
  bnf: { /* fill in inside individual tests */ }
}

describe('the context-free grammar utilities', () => {
  describe('isTerminal(symbol, cfg)', () => {    
    it('should return false given a nonterminal', () => {
      expect(isTerminal(cfg.nonterminals.S, cfg)).toBeFalsy()
    })

    it('should return true given a terminal', () => {
      expect(isTerminal(cfg.terminals.identifier, cfg)).toBeTruthy()
    })
  })

  describe('firstSet(nonterminal, cfg)', () => {    
    it('should return the correct first set for a deep derived nonterminal', () => {
      // create test grammar
      const g = {
        ...cfg,
        bnf: {
          [nonterminals.S]: [ [ nonterminals.A ] ],
          [nonterminals.A]: [
            [ nonterminals.B, nonterminals.D ],
            [ terminals.quote, nonterminals.B, terminals.quote ],
            [ nonterminals.C ],
          ],
          [nonterminals.B]: [
            [ terminals.lbracket, nonterminals.D, terminals.rbracket ],
          ],
          [nonterminals.C]: [
            [ nonterminals.D ],
            [ terminals.lparen, nonterminals.A, terminals.rparen ],
          ],
          [nonterminals.D]: [ [ terminals.identifier ] ],          
        }
      }
      const expectedFirstSet = [ terminals.quote, terminals.lbracket, terminals.identifier, terminals.lparen ]
      expect(firstSet(cfg.nonterminals.S, g).sort()).toEqual(expectedFirstSet.sort())
    })

    it('should return the correct first set for a deep derived nonterminal with duplicates', () => {
      // create test grammar
      const g = {
        ...cfg,
        bnf: {
          [nonterminals.S]: [ [ nonterminals.A ] ],
          [nonterminals.A]: [
            [ nonterminals.B, nonterminals.D ],
            [ terminals.quote, nonterminals.B, terminals.quote ],
            [ nonterminals.C ],
          ],
          [nonterminals.B]: [
            [ terminals.lbracket, nonterminals.D, terminals.rbracket ],
            [ terminals.identifier ],
          ],
          [nonterminals.C]: [
            [ nonterminals.D ],
            [ terminals.lparen, nonterminals.A, terminals.rparen ],
          ],
          [nonterminals.D]: [ [ terminals.identifier ] ],          
        }
      }
      const expectedFirstSet = [ terminals.quote, terminals.lbracket, terminals.identifier, terminals.identifier, terminals.lparen ]
      expect(firstSet(cfg.nonterminals.S, g).sort()).toEqual(expectedFirstSet.sort())
    })

    it('should throw a CyclicGrammarError if the grammar is Left-Recursive', () => {
      // create test grammar
      const g = {
        ...cfg,
        bnf: {
          [nonterminals.S]: [ [ nonterminals.A ] ],
          [nonterminals.A]: [ [ nonterminals.B ] ],
          [nonterminals.B]: [ [ nonterminals.C ] ],
          [nonterminals.C]: [ [ nonterminals.D ] ],
          [nonterminals.D]: [ [ nonterminals.A ] ],
        }
      }
      expect(() => { firstSet(cfg.nonterminals.S, g) } ).toThrowError(new CyclicGrammarError(nonterminals.A))
    })
  })
})

describe('hasCycles(cfg)', () => {    
  it('should return false for a cfg with no cycles', () => {
    // create test grammar
    const g = {
      ...cfg,
      bnf: {
        [nonterminals.S]: [ [ nonterminals.A ] ],
        [nonterminals.A]: [ [ nonterminals.B ] ],
        [nonterminals.B]: [ [ nonterminals.C ] ],
        [nonterminals.C]: [ [ nonterminals.D ] ],
        [nonterminals.D]: [ [ terminals.identifier ] ],
      }
    }
    expect(hasCycles(g)).toBeFalsy()
  })

  it('should return true for a cfg with cycles', () => {
    // create test grammar
    const g = {
      ...cfg,
      bnf: {
        [nonterminals.S]: [ [ nonterminals.A ] ],
        [nonterminals.A]: [ [ nonterminals.B ] ],
        [nonterminals.B]: [ [ nonterminals.C ] ],
        [nonterminals.C]: [ [ nonterminals.D ] ],
        [nonterminals.D]: [ [ nonterminals.A ] ],
      }
    }
    expect(hasCycles(g)).toBeTruthy()
  })
})
