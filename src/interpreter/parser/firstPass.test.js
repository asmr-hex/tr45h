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
      const parser = newTestParser([])
      
      it('returns false', () => {
        expect(parser.isAssignment()).toBeFalsy()
      })
    })
    describe('when at the final token', () => {
      const tokens = [
        newLexicalToken({type: LexicalTokenType.Identifier, value: 'mySound'}),
      ]
      const parser = newTestParser(tokens)
      
      it('returns false', () => {
        expect(parser.isAssignment()).toBeFalsy()
      })
    })
    describe('when at valid assignments', () => {
      it(`returns true, given 'A = B'`, () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '='}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'B'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isAssignment()).toBeTruthy()
      })
      it(`returns true, given 'A = <function>'`, () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '='}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'reverb'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isAssignment()).toBeTruthy()
      })
      it(`returns true, given 'A = <function> #comment'`, () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '='}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'reverb'}),
          newLexicalToken({type: LexicalTokenType.Comment, value: '#comment'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isAssignment()).toBeTruthy()
      })
      it(`returns true, given 'A =' (even with no bound value)`, () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '='}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isAssignment()).toBeTruthy()
      })
      it(`returns true, given 'A = .' (even with invalid bound value)`, () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '='}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '.'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isAssignment()).toBeTruthy()
      })
      it(`returns true, given '"A" = ' (with a string as the binding variable)`, () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: '"A"'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '='}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isAssignment()).toBeTruthy()
      })
    })
    describe('when at invalid assignments', () => {
      it(`returns false, given '= A' (no binding variable)`, () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Operator, value: '='}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isAssignment()).toBeFalsy()
      })
      it(`returns false, given 'A B =' (multiple leading identifiers)`, () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'B'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '='}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isAssignment()).toBeFalsy()
      })
      it(`returns false, given '[A B] =' (leading brackets)`, () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Bracket, value: '['}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'B'}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: ']'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '='}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isAssignment()).toBeFalsy()
      })
    })
  })

  describe('isSequence()', () => {
    describe('when at the end of a token stream', () => {
      const parser = newTestParser([])
      
      it('returns false', () => {
        expect(parser.isSequence()).toBeFalsy()
      })
    })
    describe('when at valid sequence', () => {
      it('returns true, given [ ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Bracket, value: '['}),
        ]
        const parser = newTestParser(tokens)
        expect(parser.isSequence()).toBeTruthy()
      })
      it('returns true, given ( ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
        ]
        const parser = newTestParser(tokens)
        expect(parser.isSequence()).toBeTruthy()
      })
      it('returns true, given A ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
        ]
        const parser = newTestParser(tokens)
        expect(parser.isSequence()).toBeTruthy()
      })
      it('returns true, given "string literal" ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'string literal'}),
        ]
        const parser = newTestParser(tokens)
        expect(parser.isSequence()).toBeTruthy()
      })
      describe('given a repetition operator', () => {
        it('returns true, given 3 * A', () => {
          const tokens = [
            newLexicalToken({type: LexicalTokenType.Number, value: 3}),
            newLexicalToken({type: LexicalTokenType.Operator, value: '*'}),
            newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
          ]
          const parser = newTestParser(tokens)
          expect(parser.isSequence()).toBeTruthy()
        })
        it('returns true, given A * 3', () => {
          const tokens = [
            newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
            newLexicalToken({type: LexicalTokenType.Operator, value: '*'}),
            newLexicalToken({type: LexicalTokenType.Number, value: 3}),
          ]
          const parser = newTestParser(tokens)
          parser.token.index = 1
          expect(parser.isSequence()).toBeTruthy()
        })
        it('returns true, given 3 * [', () => {
          const tokens = [
            newLexicalToken({type: LexicalTokenType.Number, value: 3}),
            newLexicalToken({type: LexicalTokenType.Operator, value: '*'}),
            newLexicalToken({type: LexicalTokenType.Bracket, value: '['}),
          ]
          const parser = newTestParser(tokens)
          expect(parser.isSequence()).toBeTruthy()
        })
        it('returns true, given ] * 3', () => {
          const tokens = [
            newLexicalToken({type: LexicalTokenType.Bracket, value: ']'}),
            newLexicalToken({type: LexicalTokenType.Operator, value: '*'}),
            newLexicalToken({type: LexicalTokenType.Number, value: 3}),
          ]
          const parser = newTestParser(tokens)
          parser.token.index = 1
          expect(parser.isSequence()).toBeTruthy()
        })
        it('returns true, given 3 * (', () => {
          const tokens = [
            newLexicalToken({type: LexicalTokenType.Number, value: 3}),
            newLexicalToken({type: LexicalTokenType.Operator, value: '*'}),
            newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
          ]
          const parser = newTestParser(tokens)
          expect(parser.isSequence()).toBeTruthy()
        })
        it('returns true, given ) * 3', () => {
          const tokens = [
            newLexicalToken({type: LexicalTokenType.Bracket, value: ')'}),
            newLexicalToken({type: LexicalTokenType.Operator, value: '*'}),
            newLexicalToken({type: LexicalTokenType.Number, value: 3}),
          ]
          const parser = newTestParser(tokens)
          parser.token.index = 1
          expect(parser.isSequence()).toBeTruthy()
        })
      })
    })
    describe('when at invalid sequence', () => {
      it('returns false, given <function> ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'reverb'}),
        ]
        const parser = newTestParser(tokens)
        expect(parser.isSequence()).toBeFalsy()
      })
      it('returns false, given 3 * 3 ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Number, value: 3}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '*'}),
          newLexicalToken({type: LexicalTokenType.Number, value: 3}),
        ]
        const parser = newTestParser(tokens)
        expect(parser.isSequence()).toBeFalsy()
      })
      it('returns false, given ) * ( ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Bracket, value: ')'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '*'}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1
        expect(parser.isSequence()).toBeFalsy()
      })
      it('returns false, given ] * [ ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Bracket, value: ']'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '*'}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: '['}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1
        expect(parser.isSequence()).toBeFalsy()
      })
    })
  })

  describe('isComment()', () => {
    describe('when at the end of a token stream', () => {
      const parser = newTestParser([])
      
      it('returns false', () => {
        expect(parser.isComment()).toBeFalsy()
      })
    })
    describe('when at valid comment', () => {
      it('returns true, given # cool comment ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Comment, value: '# cool comment'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isComment()).toBeTruthy()
      })
    })
  })

  describe('isNumber()', () => {
    describe('when at the end of a token stream', () => {
      const parser = newTestParser([])
      
      it('returns false', () => {
        expect(parser.isNumber()).toBeFalsy()
      })
    })
    describe('when at valid number', () => {
      it('returns true, given __ ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Number, value: 3.45}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isNumber()).toBeTruthy()
      })
    })
  })
  
  describe('isHz()', () => {
    describe('when at the end of a token stream', () => {
      const parser = newTestParser([])
      
      it('returns false', () => {
        expect(parser.isHz()).toBeFalsy()
      })
    })
    describe('when at valid hz number', () => {
      it('returns true, given 3.45hz ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Hz, value: 3.45}),
          newLexicalToken({type: LexicalTokenType.HzUnit, value: 'hz'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isHz()).toBeTruthy()
      })
    })
    describe('when at invalid hz number', () => {
      it('returns false, given 3.45 (missing Hz Unit) ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Hz, value: 3.45}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isHz()).toBeFalsy()
      })
    })
  })

  describe('isChoice()', () => {
    describe('when at the end of a token stream', () => {
      const parser = newTestParser([])
      
      it('returns false', () => {
        expect(parser.isChoice()).toBeFalsy()
      })
    })
    describe('when at the final token with no preceeding token', () => {
      it('returns false', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Operator, value: '|'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isChoice()).toBeFalsy()
      })
    })
    describe('when at the final token with preceeding token', () => {
      it('returns false', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '|'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isChoice()).toBeFalsy()
      })
    })
    describe('when at valid choice', () => {
      it('returns true, given A | B ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '|'}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'B'}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isChoice()).toBeTruthy()        
      })
      it('returns true, given ) | B ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Bracket, value: ')'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '|'}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'B'}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isChoice()).toBeTruthy()        
      })
      it('returns true, given ] | B ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Bracket, value: ']'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '|'}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'B'}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isChoice()).toBeTruthy()        
      })
      it('returns true, given A | ( ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '|'}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isChoice()).toBeTruthy()
      })
      it('returns true, given A | [ ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '|'}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: '['}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isChoice()).toBeTruthy()        
      })
    })
    describe('when at invalid choice', () => {
      it('returns false, given <function> | A ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'reverb'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '|'}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isChoice()).toBeFalsy()        
      })
      it('returns false, given A | <function> ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '|'}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'reverb'}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isChoice()).toBeFalsy()
      })
      it('returns false, given A | 3.3 ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '|'}),
          newLexicalToken({type: LexicalTokenType.Number, value: 3.3}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isChoice()).toBeFalsy()
      })
    })
  })

  describe('isChoiceParameter()', () => {
    describe('when at the end of a token stream', () => {
      const parser = newTestParser([])
      
      it('returns false', () => {
        expect(parser.isChoiceParameter()).toBeFalsy()
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isChoiceParameter()).toBeFalsy()
      })
    })
    describe('when at valid choice parameter', () => {
      it('returns true, given (3.3)', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
          newLexicalToken({type: LexicalTokenType.Number, value: 3.3}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: ')'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isChoiceParameter()).toBeTruthy()
      })
    })
    describe('when at invalid choice parameter', () => {
      it('returns false, given ( A )', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: ')'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isChoiceParameter()).toBeFalsy()
      })
    })
  })

  describe('isChainOperator()', () => {
    describe('when at the end of a token stream', () => {
      const parser = newTestParser([])
      
      it('returns false', () => {
        expect(parser.isChainOperator()).toBeFalsy()
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '.'}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isChainOperator()).toBeFalsy()
      })
    })
    describe('when at valid chain operator', () => {
      it('returns true, given A . <function> ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '.'}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'reverb'}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isChainOperator()).toBeTruthy()
      })
      it('returns true, given ) . <function> ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Bracket, value: ')'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '.'}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'reverb'}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isChainOperator()).toBeTruthy()
      })
      it('returns true, given ] . <function> ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Bracket, value: ']'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '.'}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'reverb'}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isChainOperator()).toBeTruthy()
      })
      it('returns true, given <function> . <function> ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'pan'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '.'}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'reverb'}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isChainOperator()).toBeTruthy()
      })
    })
    describe('when at invalid chain operator', () => {
      it('returns false, given reverb . A (cannot chain a sound literal)', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'pan'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '.'}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isChainOperator()).toBeFalsy()
      })
      it('returns false, given reverb . ( (cannot chain a sequence)', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'pan'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '.'}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isChainOperator()).toBeFalsy()
      })
      it('returns false, given reverb . [ (cannot chain a beat division)', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'pan'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '.'}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: '['}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isChainOperator()).toBeFalsy()
      })
    })
  })

  describe('isRepetitionOperator()', () => {
    describe('when at the end of a token stream', () => {
      const parser = newTestParser([])
      
      it('returns false', () => {
        expect(parser.isRepetitionOperator()).toBeFalsy()
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Number, value: 3}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '*'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isRepetitionOperator()).toBeFalsy()
      })
    })
    describe('when at valid repetition operator', () => {
      it('returns true, given 3 * A ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Number, value: 3}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '*'}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isRepetitionOperator()).toBeTruthy()
      })
      it('returns true, given A * 3 ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'A'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '*'}),
          newLexicalToken({type: LexicalTokenType.Number, value: 3}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isRepetitionOperator()).toBeTruthy()
      })
      it('returns true, given 3 * ( ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Number, value: 3}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '*'}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isRepetitionOperator()).toBeTruthy()
      })
      it('returns true, given ) * 3 ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Bracket, value: ')'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '*'}),
          newLexicalToken({type: LexicalTokenType.Number, value: 3}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isRepetitionOperator()).toBeTruthy()
      })
      it('returns true, given 3 * [ ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Number, value: 3}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '*'}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: '['}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isRepetitionOperator()).toBeTruthy()
      })
      it('returns true, given ] * 3 ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Bracket, value: ']'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '*'}),
          newLexicalToken({type: LexicalTokenType.Number, value: 3}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isRepetitionOperator()).toBeTruthy()
      })
      it('returns true, given <function> * 3 (function can be chained to a sound literal)', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'reverb'}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '*'}),
          newLexicalToken({type: LexicalTokenType.Number, value: 3}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.isRepetitionOperator()).toBeTruthy()
      })
    })
    describe('when at invalid repetition operator', () => {
      it('returns false, given 3 * <function> ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Number, value: 3}),
          newLexicalToken({type: LexicalTokenType.Operator, value: '*'}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'reverb'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isRepetitionOperator()).toBeFalsy()
      })
    })
  })

  describe('isVariable()', () => {
    describe('when at the end of a token stream', () => {
      const parser = newTestParser([])
      
      it('returns false', () => {
        expect(parser.isVariable()).toBeFalsy()
      })
    })
    describe('when at valid variable', () => {
      it('returns true, given a variable ', () => {
        // TODO need to add a variable to the symbol table for this test setup
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'myVariable'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isVariable()).toBeTruthy()
      })
    })
    describe('when at invalid variable', () => {
      it('returns false, given <function> ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'reverb'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isVariable()).toBeFalsy()
      })
      it('returns false, given sound literal ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'piano'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isVariable()).toBeFalsy()
      })
    })
  })

  describe('isFn()', () => {
    describe('given no input', () => {
      const parser = newTestParser([])
      
      it('returns false', () => {
        expect(parser.isFn()).toBeFalsy()
      })
    })
    describe('when at valid function', () => {
      it('returns true, given <function> ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'reverb'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isFn(tokens[0].value)).toBeTruthy()
      })
    })
    describe('when at invalid function', () => {
      it('returns false, given sound literal ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'piano'}),
        ]
        const parser = newTestParser(tokens)

        expect(parser.isFn(tokens[0].value)).toBeFalsy()
      })
    })
  })

  describe('isSoundLiteral()', () => {
    describe('given no input', () => {
      const parser = newTestParser([])
      
      it('returns false', () => {
        expect(parser.isSoundLiteral()).toBeFalsy()
      })
    })
    describe('when at valid sound literal', () => {
      it('returns true, given sound literal ', () => {
        const parser = newTestParser([])
        expect(parser.isSoundLiteral("piano")).toBeTruthy()
      })
    })
    describe('when at invalid sound literal', () => {
      it('returns false, given <variable>', () => {
        // TODO register "myVar" as a variable for this test setup!
        const parser = newTestParser([])
        expect(parser.isSoundLiteral("myVar")).toBeFalsy()
      })
      it('returns false, given <function>', () => {
        const parser = newTestParser([])
        expect(parser.isSoundLiteral("reverb")).toBeFalsy()
      })
    })
  })

  describe('hasQueryParameters()', () => {
    describe('when at the end of a token stream', () => {
      const parser = newTestParser([])
      
      it('returns false', () => {
        expect(parser.hasQueryParameters()).toBeFalsy()
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'soundLiteral'}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.hasQueryParameters()).toBeFalsy()
      })
    })
    describe('when at valid sound literal with query parameters', () => {
      it('returns true, given soundLiteral ( note ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'soundLiteral'}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'note'}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.hasQueryParameters()).toBeTruthy()
      })
    })
    describe('when at invalid sound literal with query parameters', () => {
      it('returns false, given soundLiteral ( bad_param ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'soundLiteral'}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'bad_param'}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.hasQueryParameters()).toBeFalsy()
      })
      it('returns false, given <function> ( note ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'reverb'}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'note'}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.hasQueryParameters()).toBeFalsy()
      })
      it('returns false, given <variable> ( note ', () => {
        // TODO register 'myVariable' in symbolTable for test setup
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'myVariable'}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'note'}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.hasQueryParameters()).toBeFalsy()
      })
    })
  })

  describe('hasFnParameters()', () => {
    describe('when at the end of a token stream', () => {
      const parser = newTestParser([])
      
      it('returns false', () => {
        expect(parser.hasFnParameters()).toBeFalsy()
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'reverb'}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.hasFnParameters()).toBeFalsy()
      })
    })
    describe('when at valid function with query parameters', () => {
      it('returns true, given reverb(time', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'reverb'}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'time'}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.hasFnParameters(tokens[0].value)).toBeTruthy()
      })
    })
    describe('when at invalid function with query parameters', () => {
      it('returns false, given reverb(bad_param ', () => {
        const tokens = [
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'reverb'}),
          newLexicalToken({type: LexicalTokenType.Bracket, value: '('}),
          newLexicalToken({type: LexicalTokenType.Identifier, value: 'bad_param'}),
        ]
        const parser = newTestParser(tokens)
        parser.token.index = 1

        expect(parser.hasFnParameters(tokens[0].value)).toBeFalsy()
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
