import { BehaviorSubject } from 'rxjs'
import { getTheme, Theme } from '../../ui/themes'

import {
  newSemanticToken,
  SemanticTokenType,
  LexicalTokenType,
} from '../types/tokens'
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

const resetTestParser = (parser, tokens, stmtType, errors) => {
  parser.reset({stmtType, tokens, errors}, testBlockKey, testBlockIndex)
}

const newTestParser = (tokens, stmtType=null, errors=[]) => {
  const symbolTable = new SymbolTable(new BehaviorSubject(getTheme(Theme.Light)))
  const parser = new SecondPassParser(symbolTable)
  resetTestParser(parser, tokens, stmtType, errors)

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
})
