import { getTheme, Theme } from '../../themes'
import {
  newLexicalToken,
  LexicalTokenType,
  newSemanticToken,
  SemanticTokenType,
  newErrorToken,
} from '../types/tokens'
import { SymbolTable } from '../symbols'
import { FirstPassParser } from './firstPass'


////////////////////
//                //
//  TEST HELPERS  //
//                //
////////////////////
const testSymbolTable = new SymbolTable(getTheme(Theme.Light))
const testBlockKey = 'test-block-key'
const testBlockIndex = 888

const resetTestParser = (parser, tokens, errors=[]) => {
  const lexicalResults = { tokens, errors }
  parser.reset(lexicalResults, testBlockKey, testBlockIndex)  
}

const newTestParser = (tokens, errors=[]) => {
  const parser = new FirstPassParser(testSymbolTable)
  resetTestParser(parser, tokens, errors)
  return parser
}


describe('The First Pass Parser', () => {
  
  //////////////////////////////
  //                          //
  //  INTERNAL STATE METHODS  //
  //                          //
  //////////////////////////////
  
  describe('reset()', () => {
    const symbolTable = new SymbolTable(getTheme(Theme.Light))
    const parser = new FirstPassParser(symbolTable)
    
    it('initializes internal state', () => {
      const tokens = [ newLexicalToken({type: LexicalTokenType.Identifier, value: 'mySound'}) ]
      const errors = [ newErrorToken({}) ]
      resetTestParser(parser, tokens, errors)

      expect(parser.token).toEqual({ stream: tokens, index: 0})
      expect(parser.block).toEqual({key: testBlockKey, index: testBlockIndex})
      expect(parser.result).toEqual({tokens: [], errors})
    })
  })

  describe('peek()', () => {    
    describe('given no parameters', () => {
      const tokens = [
        newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
        newLexicalToken({type: LexicalTokenType.Identifier, value: 'mySound'}),
        newLexicalToken({type: LexicalTokenType.Bracket, value: ')'})
      ]
      const parser = newTestParser(tokens)
      
      it('returns the current stream token', () => {
        expect(parser.token.index).toEqual(0)
        expect(parser.peek()).toEqual(tokens[0])
      })
      it('returns null at the end of the token stream', () => {
        // set to end of token stream
        parser.token.index = 3
        
        expect(parser.token.index).toEqual(3)
        expect(parser.peek()).toBeNull()
      })
    })
    describe('given positive skipAhead param', () => {
      const tokens = [
        newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
        newLexicalToken({type: LexicalTokenType.Identifier, value: 'mySound'}),
        newLexicalToken({type: LexicalTokenType.Bracket, value: ')'})
      ]
      const parser = newTestParser(tokens)

      it('returns the next stream token', () => {
        expect(parser.token.index).toEqual(0)
        expect(parser.peek(1)).toEqual(tokens[1])
      })
      it('returns null if the skipAhead is out of bounds', () => {
        expect(parser.token.index).toEqual(0)
        expect(parser.peek(3)).toBeNull()
      })
    })
    describe('given negative skipAhead param', () => {
      const tokens = [
        newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
        newLexicalToken({type: LexicalTokenType.Identifier, value: 'mySound'}),
        newLexicalToken({type: LexicalTokenType.Bracket, value: ')'})
      ]
      const parser = newTestParser(tokens)
      parser.token.index = 1
      
      it('returns the previous stream token', () => {
        expect(parser.token.index).toEqual(1)
        expect(parser.peek(-1)).toEqual(tokens[0])
      })
      it('returns null if the skipAhead is out of bounds', () => {
        expect(parser.token.index).toEqual(1)
        expect(parser.peek(-2)).toBeNull()
      })
    })
  })

  describe('getLastTokenEnd()', () => {
    it('needs a better name...', () => {
      expect().toBeTruthy()
    })
  })

  describe('advance()', () => {
    describe('when not at the terminal stream token', () => {
      const tokens = [
        newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
        newLexicalToken({type: LexicalTokenType.Identifier, value: 'mySound'}),
        newLexicalToken({type: LexicalTokenType.Bracket, value: ')'})
      ]
      const parser = newTestParser(tokens)
      
      it('returns the next token and increments the index', () => {
        expect(parser.advance()).toEqual(tokens[1])
        expect(parser.token.index).toEqual(1)
      })
    })
    describe('when at the terminal stream token', () => {
      const tokens = [
        newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
        newLexicalToken({type: LexicalTokenType.Identifier, value: 'mySound'}),
        newLexicalToken({type: LexicalTokenType.Bracket, value: ')'})
      ]
      const parser = newTestParser(tokens)
      parser.token.index = 2
      
      it('returns null and increments the index', () => {
        expect(parser.advance()).toBeNull()
        expect(parser.token.index).toEqual(3)
      })
    })
  })

  describe('consume()', () => {
    const tokens = [
      newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
      newLexicalToken({type: LexicalTokenType.Identifier, value: 'mySound'}),
      newLexicalToken({type: LexicalTokenType.Bracket, value: ')'})
    ]
    const parser = newTestParser(tokens)
    parser.token.index = 1
    
    it('returns the current token and increments the index', () => {
      expect(parser.consume()).toEqual(tokens[1])
      expect(parser.token.index).toEqual(2)
    })

    it('returns null and increments the index when out of bounds', () => {
      parser.token.index = 3
      expect(parser.consume()).toBeNull()
      expect(parser.token.index).toEqual(4)
    })
  })

  describe('pushToken()', () => {
    const tokens = [
      newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
      newLexicalToken({type: LexicalTokenType.Identifier, value: 'mySound'}),
      newLexicalToken({type: LexicalTokenType.Bracket, value: ')'})
    ]
    const parser = newTestParser(tokens)
    
    it('appends a new semantic token onto the result token array', () => {
      const expected = newSemanticToken({...tokens[1], type: SemanticTokenType.SoundLiteral})
      expect(parser.result.tokens).toEqual([])
      parser.pushToken(expected)
      expect(parser.result.tokens).toEqual([expected])
    })
  })

  describe('pushError()', () => {
    const errors = [
      newErrorToken({}),
    ]
    const parser = newTestParser([])
    
    it('appends a new error token onto the result error array', () => {
      expect(parser.result.errors).toEqual([])
      parser.pushError(errors[0])
      expect(parser.result.errors).toEqual(errors)
    })
  })

  ////////////////////
  //                //
  //  TEST METHODS  //
  //                //
  ////////////////////

  describe('isAssignment()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid assignments', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid assignments', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isSequence()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid sequence', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid sequence', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isComment()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid comment', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid comment', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isNumber()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid number', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid number', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })
  
  describe('isHz()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid hz number', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid hz number', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isChoice()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid choice', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid choice', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isChoiceParameter()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid choice parameter', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid choice parameter', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isChainOperator()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid chain operator', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid chain operator', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isRepetitionOperator()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid repetition operator', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid repetition operator', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isVariable()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid variable', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid variable', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isFn()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid function', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid function', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isSoundLiteral()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid sound literal', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid sound literal', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isQueryParameters()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid sound literal with query parameters', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid sound literal with query parameters', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isFnParameters()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid function with query parameters', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid function with query parameters', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isFnParameters()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid function with query parameters', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid function with query parameters', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  ////////////////////
  //                //
  // PARSE METHODS  //
  //                //
  ////////////////////

  describe('parseEndOfStatement()', () => {
    expect().toBeTruthy()
  })

  describe('parseComment()', () => {
    expect().toBeTruthy()
  })

  describe('parseAssignment()', () => {
    expect().toBeTruthy()
  })

  describe('parseErrorUntilEndOfParamScope()', () => {
    expect().toBeTruthy()
  })

  describe('parseFnParameters()', () => {
    expect().toBeTruthy()
  })

  describe('parseFnChain()', () => {
    expect().toBeTruthy()
  })

  describe('parseFn()', () => {
    expect().toBeTruthy()
  })

  describe('parseIdentifier()', () => {
    expect().toBeTruthy()
  })

  describe('parseChoice()', () => {
    expect().toBeTruthy()
  })

  describe('parseRepetitionOperator()', () => {
    expect().toBeTruthy()
  })

  describe('parseSequence()', () => {
    expect().toBeTruthy()
  })

  describe('parseSequenceStatement()', () => {
    expect().toBeTruthy()
  })

  ///////////////
  //           //
  //  ANALYZE  //
  //           //
  ///////////////

  describe('analyze()', () => {
    expect().toBeTruthy()
  })
})
