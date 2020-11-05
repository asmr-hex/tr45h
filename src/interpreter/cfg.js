
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
  lparen: /\(/,
  rparen: /\)/,
  lbracket: /\[/,
  rbracket: /\]/,
  quote: /[\"\']/,
  identifier: /^[A-Za-z]+(?:(?!->)[^\s\[\]\(\)\'\"\#\=\.])+$/,
}

export const ContextFreeGrammar = {
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

// TODO write algorithm for L-Recursion Elimination

// TODO write algorithm for L-Factoring

