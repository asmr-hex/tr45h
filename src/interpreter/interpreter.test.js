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
      
      describe('import statements', () => {
        it.todo(`imports stuff`)
      })

      describe('sequence statements', () => {
        it(`interprets 'apple orange pear'`, () => {
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
      })
      
    })
  })
  
})
