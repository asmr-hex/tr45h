import { BehaviorSubject } from 'rxjs'
import { getTheme, Theme } from '../../ui/themes'

import {
  Sequence,
  BeatDiv,
  Choice,
  Terminal,
} from '../types/ast/nodes'
import {
  ProcessorChain,
} from '../types/ast/functions/processors/processorChain'
import {
  newSemanticToken,
  SemanticTokenType,
  LexicalTokenType,
} from '../types/tokens'
import { Builtin } from '../types/symbols/builtin'
import { ExpressionType } from '../types/expressions'
import { SymbolTable } from '../symbolTable'
import { SecondPassParser } from './secondPass'


////////////////////
//                //
//  TEST HELPERS  //
//                //
////////////////////

const testBlockKey = 'test-block-key'
const testBlockIndex = 888
const mockAudioContext = new AudioContext()

const resetTestParser = (parser, tokens, stmtType) => {
  parser.reset({stmtType, tokens, errors: []}, testBlockKey, testBlockIndex)
}

const newTestParser = (tokens, stmtType=null, options={}) => {
  const symbolTable = new SymbolTable(new BehaviorSubject(getTheme(Theme.Light)))
  const parser = new SecondPassParser(symbolTable, mockAudioContext, options)
  resetTestParser(parser, tokens, stmtType)

  return parser
}


describe('The Second Pass Parser', () => {

    
  ///////////////
  //           //
  //  ANALYZE  //
  //           //
  ///////////////

  describe('analyze()', () => {
    describe('sequence statements', () => {
      it.todo('...')
    })

    describe('assignment statements', () => {
      it.todo('...')
    })

    describe('import statements', () => {
      it.todo('...')
    })
  })

  /////////////////////
  //                 //
  //  PARSE METHODS  //
  //                 //
  /////////////////////

  describe('parseAssignment()', () => {
    it(`parses and defines numerical variable in the symbol table: 'A = 3.3'`, () => {
      const tokens = [
        newSemanticToken({start: 0, length: 1, type: SemanticTokenType.VariableDecl, value: 'A'}),
        newSemanticToken({start: 2, length: 1, type: SemanticTokenType.AssignmentOp, value: '='}),
        newSemanticToken({start: 4, length: 3, type: LexicalTokenType.Number, value: 3.3}),
      ]
      const parser = newTestParser(tokens)

      parser.symbolTable.declareVariable(tokens[0], ExpressionType.Number)

      parser.parseAssignment()

      expect(parser.result).toEqual({ stmtType: null, ast: null })
      expect(parser.symbolTable.isVariable('A')).toBeTruthy()
      expect(parser.symbolTable.getVariable('A').resolve().type).toEqual(ExpressionType.Number)
      expect(parser.symbolTable.getVariable('A').resolve().value).toEqual(3.3)
    })
  })

  describe('parseSequenceExpr()', () => {
    it(`parses a sequence: 'apple orange pear'`, () => {
      const tokens = [
        newSemanticToken({start: 0, length: 5, type: SemanticTokenType.SoundLiteral, value: 'apple'}),
        newSemanticToken({start: 6, length: 6, type: SemanticTokenType.SoundLiteral, value: 'orange'}),
        newSemanticToken({start: 13, length: 4, type: SemanticTokenType.SoundLiteral, value: 'pear'}),
      ]
      const parser = newTestParser(tokens)

      const expectations = new Sequence([
        new Terminal({...tokens[0], fx: null, ppqn: 1}),
        new Terminal({...tokens[1], fx: null, ppqn: 1}),
        new Terminal({...tokens[2], fx: null, ppqn: 1}),
      ])
      
      expect(parser.parseSequenceExpr()).toEqual(expectations)
    })
    it(`parses a sequence with a subsequence: 'apple (orange pear)'`, () => {
      const tokens = [
        newSemanticToken({type: SemanticTokenType.SoundLiteral, value: 'apple'}),
        newSemanticToken({type: SemanticTokenType.SequenceBracket, value: '('}),
        newSemanticToken({type: SemanticTokenType.SoundLiteral, value: 'orange'}),
        newSemanticToken({type: SemanticTokenType.SoundLiteral, value: 'pear'}),
        newSemanticToken({type: SemanticTokenType.SequenceBracket, value: ')'}),
      ]
      const parser = newTestParser(tokens)

      const expectations = new Sequence([
        new Terminal({...tokens[0], fx: null, ppqn: 1}),
        new Sequence([
          new Terminal({...tokens[2], fx: null, ppqn: 1}),
          new Terminal({...tokens[3], fx: null, ppqn: 1}),
        ]),
      ])
      
      expect(parser.parseSequenceExpr()).toEqual(expectations)
    })
  })

  describe('parseSequence()', () => {
    it(`parses a sequence: '(apple orange pear)'`, () => {
      const tokens = [
        newSemanticToken({type: SemanticTokenType.SequenceBracket, value: '('}),
        newSemanticToken({start: 0, length: 5, type: SemanticTokenType.SoundLiteral, value: 'apple'}),
        newSemanticToken({start: 6, length: 6, type: SemanticTokenType.SoundLiteral, value: 'orange'}),
        newSemanticToken({start: 13, length: 4, type: SemanticTokenType.SoundLiteral, value: 'pear'}),
        newSemanticToken({type: SemanticTokenType.SequenceBracket, value: ')'}),
      ]
      const parser = newTestParser(tokens)

      const expectations = new Sequence([
        new Terminal({...tokens[1], fx: null, ppqn: 1}),
        new Terminal({...tokens[2], fx: null, ppqn: 1}),
        new Terminal({...tokens[3], fx: null, ppqn: 1}),
      ])
      
      expect(parser.parseSequence()).toEqual(expectations)
    })
    it(`parses a sequence with a sub sequence: '(apple (orange pear))'`, () => {
      const tokens = [
        newSemanticToken({type: SemanticTokenType.SequenceBracket, value: '('}),
        newSemanticToken({type: SemanticTokenType.SoundLiteral, value: 'apple'}),
        newSemanticToken({type: SemanticTokenType.SequenceBracket, value: '('}),
        newSemanticToken({type: SemanticTokenType.SoundLiteral, value: 'orange'}),
        newSemanticToken({type: SemanticTokenType.SoundLiteral, value: 'pear'}),
        newSemanticToken({type: SemanticTokenType.SequenceBracket, value: ')'}),
        newSemanticToken({type: SemanticTokenType.SequenceBracket, value: ')'}),
      ]
      const parser = newTestParser(tokens)

      const expectations = new Sequence([
        new Terminal({...tokens[1], fx: null, ppqn: 1}),
        new Sequence([
          new Terminal({...tokens[3], fx: null, ppqn: 1}),
          new Terminal({...tokens[4], fx: null, ppqn: 1}),   
        ]),
      ])
      
      expect(parser.parseSequence()).toEqual(expectations)
    })
    it(`parses a sequence with a nested beat division: '(apple [ orange pear ])'`, () => {
      const tokens = [
        newSemanticToken({type: SemanticTokenType.SequenceBracket, value: '('}),
        newSemanticToken({type: SemanticTokenType.SoundLiteral, value: 'apple'}),
        newSemanticToken({type: SemanticTokenType.BeatDivBracket, value: '['}),
        newSemanticToken({type: SemanticTokenType.SoundLiteral, value: 'orange'}),
        newSemanticToken({type: SemanticTokenType.SoundLiteral, value: 'pear'}),
        newSemanticToken({type: SemanticTokenType.BeatDivBracket, value: ']'}),
        newSemanticToken({type: SemanticTokenType.SequenceBracket, value: ')'}),
      ]
      const parser = newTestParser(tokens)

      const expectations = new Sequence([
        new Terminal({...tokens[1], fx: null, ppqn: 1}),
        new BeatDiv([
          new Terminal({...tokens[3], fx: null, ppqn: 1}),
          new Terminal({...tokens[4], fx: null, ppqn: 1}),          
        ]),
      ])
      
      expect(parser.parseSequence()).toEqual(expectations)
    })
  })

  describe('parseBeatDiv()', () => {
    it(`parses a beat division sequence: '[apple orange pear]'`, () => {
      const tokens = [
        newSemanticToken({type: SemanticTokenType.BeatDivBracket, value: '['}),
        newSemanticToken({start: 0, length: 5, type: SemanticTokenType.SoundLiteral, value: 'apple'}),
        newSemanticToken({start: 6, length: 6, type: SemanticTokenType.SoundLiteral, value: 'orange'}),
        newSemanticToken({start: 13, length: 4, type: SemanticTokenType.SoundLiteral, value: 'pear'}),
        newSemanticToken({type: SemanticTokenType.BeatDivBracket, value: ']'}),
      ]
      const parser = newTestParser(tokens)

      const expectations = new BeatDiv([
        new Terminal({...tokens[1], fx: null, ppqn: 1}),
        new Terminal({...tokens[2], fx: null, ppqn: 1}),
        new Terminal({...tokens[3], fx: null, ppqn: 1}),
      ])
      
      expect(parser.parseBeatDiv()).toEqual(expectations)
    })
  })

  describe('parseChoice()', () => {
    it(`parses a choice step: 'A | B | C'`, () => {
      const tokens = [
        newSemanticToken({type: SemanticTokenType.SoundLiteral, value: 'A'}),
        newSemanticToken({type: SemanticTokenType.ChoiceOp, value: '|'}),
        newSemanticToken({type: SemanticTokenType.SoundLiteral, value: 'B'}),
        newSemanticToken({type: SemanticTokenType.ChoiceOp, value: '|'}),
        newSemanticToken({type: SemanticTokenType.SoundLiteral, value: 'C'}),
      ]
      const choiceFn = (choices, cdf) => choices[0]  // mock choice fn
      const parser = newTestParser(tokens, null, {choiceFn})
      parser.token.index = 1

      const expectedChoices = [
        new Terminal({...tokens[0], fx: null, ppqn: 1}),
        new Terminal({...tokens[2], fx: null, ppqn: 1}),
        new Terminal({...tokens[4], fx: null, ppqn: 1}),
      ]
      
      const expectations = new Choice(expectedChoices, [1/3, 1/3, 1/3], choiceFn)
      
      expect(parser.parseChoice(expectedChoices[0])).toEqual(expectations)
    })
  })
  
  describe('parseProcessorChain()', () => {
    it(`parses processing chain: '.reverb.volume'`, () => {
      const tokens = [
        newSemanticToken({type: SemanticTokenType.ChainingOp, value: '.'}),
        newSemanticToken({type: SemanticTokenType.Fn, value: 'reverb', parameters: {}}),
        newSemanticToken({type: SemanticTokenType.ChainingOp, value: '.'}),
        newSemanticToken({type: SemanticTokenType.Fn, value: 'volume', parameters: {}}),
      ]
      const parser = newTestParser(tokens)

      const expectations = new ProcessorChain([
        Builtin.functions.reverb.initialize({}, {audioContext: mockAudioContext}),
        Builtin.functions.volume.initialize({}, {audioContext: mockAudioContext})
      ])
      
      expect(parser.parseProcessorChain()).toEqual(expectations)
    })
  })
})
