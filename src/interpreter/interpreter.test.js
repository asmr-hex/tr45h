import { BehaviorSubject } from 'rxjs'

import { getTheme, Theme } from '../ui/themes'

import { interpret } from './index'
import { SymbolTable } from './symbolTable'
import { Lexer } from './lexer'
import { FirstPassParser } from './parser/firstPass'
import { SecondPassParser } from './parser/secondPass'

import {
  newSemanticToken,
  SemanticTokenType,
  LexicalTokenType,
} from './types/tokens'
import { StatementType } from './types/statements'
import {
  Sequence,
  BeatDiv,
  Choice,
  Variable,
  Repetition,
  Terminal,
} from './types/ast/nodes'


const mockAudioContext = new AudioContext()
const testBlockKey = 'b33fdad'
const newTestLexer = () => new Lexer()
const newTestSymbolTable = () => new SymbolTable(new BehaviorSubject(getTheme(Theme.Light)))
const newTestFirstPassParser = symbolTable => new FirstPassParser(symbolTable)
const newTestSecondPassParser = (symbolTable, options={}) => new SecondPassParser(symbolTable, mockAudioContext, options)
const newTestInterpreter = (options={}) => txt => {
  const { symbolTable, blockKey, blockIndex } = options
  const key = blockKey || testBlockKey
  const index = blockIndex || 0
  const s = symbolTable || newTestSymbolTable()
  const l = newTestLexer()
  const p1 = newTestFirstPassParser(s)
  const p2 = newTestSecondPassParser(s, options)

  return p2.analyze(p1.analyze(l.tokenize(txt, key), key, index), key, index)
}


describe('the interpreter', () => {

  ////////////////////////////////////////////////////////////
  //                                                        //               
  //                E2E INTEGRATION TESTS                   //
  //  ( lexer -> first-pass parser -> second-pass-parser )  //
  //                                                        //
  ////////////////////////////////////////////////////////////

  describe('interpreting single statements', () => {
    describe(' using lexer->parser1->parser2', () => {
      
      describe('on import statements', () => {
        it.todo(`imports stuff`)
      })

      describe('on sequence statements', () => {
        it(`can intepret: apple orange pear`, () => {
          const txt = `apple orange pear`
          const interpret = newTestInterpreter()

          const expectations = {
            ast: new Sequence([
              new Terminal(newSemanticToken({block: testBlockKey, start: 0, length: 5, type: SemanticTokenType.SoundLiteral, id: 'apple__', value: 'apple', fx: null, ppqn: 1, parameters: {}})),
              new Terminal(newSemanticToken({block: testBlockKey, start: 6, length: 6, type: SemanticTokenType.SoundLiteral, id: 'orange__', value: 'orange', fx: null, ppqn: 1, parameters: {}})),
              new Terminal(newSemanticToken({block: testBlockKey, start: 13, length: 4, type: SemanticTokenType.SoundLiteral, id: 'pear__', value: 'pear', fx: null, ppqn: 1, parameters: {}})),
            ]),
            stmtType: StatementType.Sequence,
          }

          expect(interpret(txt)).toEqual(expectations)
        })

        it.todo(`can interpret: (A B C)`)
        it.todo(`can interpret: [A B C]`)
        it.todo(`can interpret: (A [B C])`)
        it.todo(`can interpret: [A (B C)]`)
        it.todo(`can interpret: [A (B C)]`)
        it.todo(`can interpret: [A (B C)]`)
        it.todo(`can interpret: "A B" C`)
        it.todo(`can interpret: 'A B' C`)
        it.todo(`can interpret: '"A B"' C`)
        it.todo(`can interpret: A * 3`)
        it.todo(`can interpret: 3 * A`)
        it.todo(`can interpret: (A B C) * 3`)
        it.todo(`can interpret: 3 * (A B C)`)
        it.todo(`can interpret: 3 * [A B C]`)
        it.todo(`can interpret: [A B C] * 3`)
        it.todo(`can interpret: [A B C] * 3`)
        it.todo(`can interpret: [A B * 3 C]`)
        it.todo(`can interpret: A.reverb`)
        it.todo(`can interpret: A.reverb.volume`)
        it.todo(`can interpret: A.reverb(time: 3.3)`)
        it.todo(`can interpret: A.reverb(3.3)`)
        it.todo(`can interpret: (A B C).reverb.volume`)
        it.todo(`can interpret: [A B C].reverb.volume`)
        it.todo(`can interpret: A.reverb().volume`)
        it.todo(`can interpret: A.reverb(3.3, decay: 2).volume`)
        it.todo(`can interpret: A(440Hz)`)
        it.todo(`can interpret: A(note:440Hz)`)
        it.todo(`can interpret: A(note:440Hz, isolated, loop)`)
        it.todo(`can interpret: A(note:440Hz, isolated, loop).reverb`)
        it.todo(`can interpret: A(note:440Hz, isolated, loop).reverb`)
        it.todo(`can interpret: ? * A`) // ? is re-evaluated every time its called
        it.todo(`can interpret: ?[0-4] * A`) // random within range
        it.todo(`can interpret: ?[4, 6, 8, 3] * A`) // random ints
        it.todo(`can interpret: ?[0-4, 100-90, 20.1-2.2, 3] * A`) // random list of ranges and ints
        it.todo(`can interpret: 3 * 3 * A`)
        it.todo(`can interpret: ? * 3 * A`)
        it.todo(`can interpret: A.reverb(?)`) // will only evaluate once at function initialization
        it.todo(`can interpret: A.reverb(sine(1hz))`) // oscillate the default parameter at 1hz (between 0 - 1)
        it.todo(`can interpret: A.reverb(3 * sine(1hz))`) // oscillate the default parameter at 1hz (between 0 - 3)
        it.todo(`can interpret: A.reverb(3 * sine(1hz) + 2)`) // oscillate the default parameter at 1hz (between 2 - 5)
        it.todo(`can interpret: A.reverb(3 * sine(1hz) + sine(2hz) + 2)`) // oscillate the default parameter with sum of sinusoids
        it.todo(`can interpret: A.reverb(3 * triangle(1hz))`) // oscillate the default parameter at 1hz (between 0 - 3)
        it.todo(`can interpret: A.reverb(3 * square(1hz))`) // oscillate the default parameter at 1hz (between 0 - 3)
        it.todo(`can interpret: A.reverb(3 * triangle(1hz) + sine(2hz) + 2)`) // oscillate the default parameter with sum of sinusoids (additive....you can just connect multiple lfo oscillators to parameters...)
        it.todo(`can interpret: A.reverb(sine(4 * sine(2Hz)))`) // fm oscillation! see https://medium.com/@danielmckemie/tips-and-techniques-for-using-the-web-audio-api-89b8beda6cf2
        it.todo(`can interpret: sine(440Hz)`) // an oscillator sound! in addition to sound samples....
        it.todo(`can interpret: sine(?(440,500)hz) * A`) // hmm?
      })
      
    })
  })
  
})
