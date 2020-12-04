import { Lexer } from './lexer'
import {
  SeparatorBalanceError,
  SeparatorMismatchError,
  QuoteMissingError
} from './error'


describe('Lexer', () => {
  const lexer = new Lexer()

  describe('.advance()', () => {
    it('advances to the next character', () => {
      lexer.reset()
      const str = 'abcde'
      lexer.input = str
      lexer.char = str[0]
      for (let i = 0; i < str.length; i++) {
        expect(lexer.index).toEqual(i)
        expect(lexer.char).toEqual(str[i])
        lexer.advance()
      }
    })

    it('returns the next character', () => {
      lexer.reset()
      const str = 'abcde'
      lexer.input = str
      lexer.char = str[0]
      for (let i = 0; i < str.length - 1; i++) {
        expect(lexer.advance()).toEqual(str[i+1])
      }
    })
  })
  
  describe('.isWhitespace(c)', () => {
    it('detects space', () => {
      expect(lexer.isWhiteSpace(' ')).toBeTruthy()
    })

    it('detects carriage return character', () => {
      expect(lexer.isWhiteSpace('\r')).toBeTruthy()
    })

    it('detects newline character', () => {
      expect(lexer.isWhiteSpace('\n')).toBeTruthy()
    })

    it('detects tab character', () => {
      expect(lexer.isWhiteSpace('\n')).toBeTruthy()
    })
  })

  describe('.isSeparator(c)', () => {
    it('detects open paren', () => {
      expect(lexer.isSeparator('(')).toBeTruthy()
    })
    it('detects closed paren', () => {
      expect(lexer.isSeparator(')')).toBeTruthy()
    })
    it('detects open curly bracket', () => {
      expect(lexer.isSeparator('{')).toBeTruthy()
    })
    it('detects closed curly bracket', () => {
      expect(lexer.isSeparator('}')).toBeTruthy()
    })
    it('detects open square bracket', () => {
      expect(lexer.isSeparator('[')).toBeTruthy()
    })
    it('detects closed square bracket', () => {
      expect(lexer.isSeparator(']')).toBeTruthy()
    })
    it('detects commas', () => {
      expect(lexer.isSeparator(',')).toBeTruthy()
    })
  })

  describe('.isQuote(c)', () => {
    it('detects double quotes', () => {
      expect(lexer.isQuote('"')).toBeTruthy()
    })
    it('detects single quotes', () => {
      expect(lexer.isQuote('\'')).toBeTruthy()
    })
  })
  
  describe('.isOperator(c)', () => {
    it('detects logical OR (|)', () => {
      expect(lexer.isOperator('|')).toBeTruthy()
    })
    it('detects assignment (=)', () => {
      expect(lexer.isOperator('=')).toBeTruthy()
    })
    it('detects function chaining  (.)', () => {
      expect(lexer.isOperator('.')).toBeTruthy()
    })
    it('does not detects a non operator (*)', () => {
      expect(lexer.isOperator('*')).toBeFalsy()
    })
  })

  describe('.isComment(c)', () => {
    it('detects comments (#)', () => {
      expect(lexer.isComment('#')).toBeTruthy()
    })
  })
  
  describe('.isDigit(c)', () => {
    it('detects all digits [0-9]', () => {
      for (let i = 0; i <= 9; i++) {
        expect(lexer.isDigit(`${i}`)).toBeTruthy()
      }
    })
  })

  describe('.isHzUnit(c)', () => {
    it('detects case-insensitive hz unit annotation', () => {
      expect(lexer.isHzUnit(`h`, `z`)).toBeTruthy()
      expect(lexer.isHzUnit(`H`, `z`)).toBeTruthy()
      expect(lexer.isHzUnit(`h`, `Z`)).toBeTruthy()
      expect(lexer.isHzUnit(`H`, `Z`)).toBeTruthy()
    })
  })

  describe('.isIdentifier(c)', () => {
    it('detects all valid characters that can be within identifiers', () => {
      const validIdentifierTokens = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!?;0123456789'
      for (let i = 0; i < validIdentifierTokens.length; i++) {
        expect(lexer.isIdentifier(validIdentifierTokens[i])).toBeTruthy()
      }
    })
  })

  describe('.tokenize(str)', () => {
    it('lexes integer numbers with > 1 digit', () => {
      const str = '  1989 '
      const expectedResult = {
        errors: [],
        tokens: [{type: 'NUMBER', value: 1989, start: 2, length: 4, block: ''}]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })
    it('lexes decimal numbers with > 1 digit', () => {
      const str = ' 1989.9891 '
      const expectedResult = {
        errors: [],
        tokens: [{type: 'NUMBER', value: 1989.9891, start: 1, length: 9, block: ''}]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })
    it('lexes integer hz values', () => {
      const str = '1989hz'
      const expectedResult = {
        errors: [],
        tokens: [
          {type: 'HZ', value: 1989, start: 0, length: 4, block: ''},
          {type: 'HZ_UNIT', value: 'hz', start: 4, length: 2, block: ''}
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })
    it('lexes decimal hz values', () => {
      const str = '1989.9891hz'
      const expectedResult = {
        errors: [],
        tokens: [
          {type: 'HZ', value: 1989.9891, start: 0, length: 9, block: ''},
          {type: 'HZ_UNIT', value: 'hz', start: 9, length: 2, block: ''}
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })

    it('lexes sequences of identifiers', () => {
      const str = ' apple orange   pear '
      const expectedResult = {
        errors: [],
        tokens: [
          {type: 'IDENTIFIER', value: 'apple', start: 1, length: 5, block: ''},
          {type: 'IDENTIFIER', value: 'orange', start: 7, length: 6, block: ''},
          {type: 'IDENTIFIER', value: 'pear', start: 16, length: 4, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })
    it('lexes sequences of identifiers with numbers in the names (except at beginning)', () => {
      const str = ' app13 or4nge   pe4r '
      const expectedResult = {
        errors: [],
        tokens: [
          {type: 'IDENTIFIER', value: 'app13', start: 1, length: 5, block: ''},
          {type: 'IDENTIFIER', value: 'or4nge', start: 7, length: 6, block: ''},
          {type: 'IDENTIFIER', value: 'pe4r', start: 16, length: 4, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })
    it('lexes parenthesis', () => {
      const str = '(one two (three) )'
      const expectedResult = {
        errors: [],
        tokens: [
          {type: 'SEPARATOR', value: '(', start: 0, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'one', start: 1, length: 3, block: ''},
          {type: 'IDENTIFIER', value: 'two', start: 5, length: 3, block: ''},
          {type: 'SEPARATOR', value: '(', start: 9, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'three', start: 10, length: 5, block: ''},
          {type: 'SEPARATOR', value: ')', start: 15, length: 1, block: ''},
          {type: 'SEPARATOR', value: ')', start: 17, length: 1, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })
    it('lexes curly brackets', () => {
      const str = '{one two {three} }'
      const expectedResult = {
        errors: [],
        tokens: [
          {type: 'SEPARATOR', value: '{', start: 0, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'one', start: 1, length: 3, block: ''},
          {type: 'IDENTIFIER', value: 'two', start: 5, length: 3, block: ''},
          {type: 'SEPARATOR', value: '{', start: 9, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'three', start: 10, length: 5, block: ''},
          {type: 'SEPARATOR', value: '}', start: 15, length: 1, block: ''},
          {type: 'SEPARATOR', value: '}', start: 17, length: 1, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })
    it('lexes square brackets', () => {
      const str = '[one two [three] ]'
      const expectedResult = {
        errors: [],
        tokens: [
          {type: 'SEPARATOR', value: '[', start: 0, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'one', start: 1, length: 3, block: ''},
          {type: 'IDENTIFIER', value: 'two', start: 5, length: 3, block: ''},
          {type: 'SEPARATOR', value: '[', start: 9, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'three', start: 10, length: 5, block: ''},
          {type: 'SEPARATOR', value: ']', start: 15, length: 1, block: ''},
          {type: 'SEPARATOR', value: ']', start: 17, length: 1, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })
    it('lexes single quotes', () => {
      const str = `'one two 'three' '`
      const expectedResult = {
        errors: [],
        tokens: [
          {type: 'IDENTIFIER', value: 'one two ', start: 0, length: 10, block: ''},
          {type: 'IDENTIFIER', value: 'three', start: 10, length: 5, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })
    it('lexes double quotes', () => {
      const str = `"one two "three" "`
      const expectedResult = {
        errors: [],
        tokens: [
          {type: 'IDENTIFIER', value: 'one two ', start: 0, length: 10, block: ''},
          {type: 'IDENTIFIER', value: 'three', start: 10, length: 5, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })
    it('lexes commas', () => {
      const str = `one, two,three`
      const expectedResult = {
        errors: [],
        tokens: [
          {type: 'IDENTIFIER', value: 'one', start: 0, length: 3, block: ''},
          {type: 'SEPARATOR', value: ',', start: 3, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'two', start: 5, length: 3, block: ''},
          {type: 'SEPARATOR', value: ',', start: 8, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'three', start: 9, length: 5, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })

    it('lexes comments', () => {
      const str = `one, two,three # well this is a fine list`
      const expectedResult = {
        errors: [],
        tokens: [
          {type: 'IDENTIFIER', value: 'one', start: 0, length: 3, block: ''},
          {type: 'SEPARATOR', value: ',', start: 3, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'two', start: 5, length: 3, block: ''},
          {type: 'SEPARATOR', value: ',', start: 8, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'three', start: 9, length: 5, block: ''},
          {type: 'COMMENT', value: '# well this is a fine list', start: 15, length: 26, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })

    it('lexes logical OR operators', () => {
      const str = `this | that`
      const expectedResult = {
        errors: [],
        tokens: [
          {type: 'IDENTIFIER', value: 'this', start: 0, length: 4, block: ''},
          {type: 'OPERATOR', value: '|', start: 5, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'that', start: 7, length: 4, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })

    it('lexes assignment operators', () => {
      const str = `this = something`
      const expectedResult = {
        errors: [],
        tokens: [
          {type: 'IDENTIFIER', value: 'this', start: 0, length: 4, block: ''},
          {type: 'OPERATOR', value: '=', start: 5, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'something', start: 7, length: 9, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })

    it('lexes chaining operator', () => {
      const str = `this.reverse`
      const expectedResult = {
        errors: [],
        tokens: [
          {type: 'IDENTIFIER', value: 'this', start: 0, length: 4, block: ''},
          {type: 'OPERATOR', value: '.', start: 4, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'reverse', start: 5, length: 7, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })

    it('lexes chaining operator after identifier with last character as a digit', () => {
      const str = `thi5.reverse`
      const expectedResult = {
        errors: [],
        tokens: [
          {type: 'IDENTIFIER', value: 'thi5', start: 0, length: 4, block: ''},
          {type: 'OPERATOR', value: '.', start: 4, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'reverse', start: 5, length: 7, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })

    
    //////////////////////
    //                  //
    //  ERROR HANDLING  //
    //                  //
    //////////////////////

    it(`handles missing double quote errors`, () => {
      const str = `" this has a missing quote`
      const expectedResults = {
        errors: [ {type: 'ERROR', tokens: [], start: 0, length: 26, reasons: [new QuoteMissingError(0)], block: '' } ],
        tokens: []
      }
      expect(lexer.tokenize(str)).toEqual(expectedResults)
    })

    it(`handles missing single quote errors`, () => {
      const str = `' this has a missing quote`
      const expectedResults = {
        errors: [ {type: 'ERROR', tokens: [], start: 0, length: 26, reasons: [new QuoteMissingError(0)], block: '' } ],
        tokens: []
      }
      expect(lexer.tokenize(str)).toEqual(expectedResults)
    })

    it(`handles dangling closing parenthesis`, () => {
      const str = `apple ) orange`
      const expectedResults = {
        errors: [
          {
            type: 'ERROR',
            tokens: [],
            start: 6,
            length: 1,
            reasons: [new SeparatorBalanceError({value: ')', location: 6})],
            block: ''
          },
        ],
        tokens: [
          {type: 'IDENTIFIER', value: 'apple', start: 0, length: 5, block: ''},
          {type: 'IDENTIFIER', value: 'orange', start: 8, length: 6, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResults)
    })

    it(`handles dangling closing square brackets`, () => {
      const str = `apple ] orange`
      const expectedResults = {
        errors: [ {type: 'ERROR', tokens: [], start: 6, length: 1, reasons: [new SeparatorBalanceError({value: ']', location: 6})], block: '' } ],
        tokens: [
          {type: 'IDENTIFIER', value: 'apple', start: 0, length: 5, block: ''},
          {type: 'IDENTIFIER', value: 'orange', start: 8, length: 6, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResults)
    })

    it(`handles unclosed parentheses`, () => {
      const str = `(apple) ((orange)`
      const expectedResults = {
        errors: [ {
          type: 'ERROR',
          tokens: [
            {type: 'SEPARATOR', value: '(', start: 8, length: 1, block: ''},
            {type: 'SEPARATOR', value: '(', start: 9, length: 1, block: ''},
            {type: 'IDENTIFIER', value: 'orange', start: 10, length: 6, block: ''},
            {type: 'SEPARATOR', value: ')', start: 16, length: 1, block: ''},
          ],
          start: 8,
          length: 9,
          reasons: [new SeparatorBalanceError({value: '(', location: 8})],
          block: ''
        } ],
        tokens: [
          {type: 'SEPARATOR', value: '(', start: 0, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'apple', start: 1, length: 5, block: ''},
          {type: 'SEPARATOR', value: ')', start: 6, length: 1, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResults)
    })

    it(`handles unclosed square brackets`, () => {
      const str = `[apple] [[orange]`
      const expectedResults = {
        errors: [ {
          type: 'ERROR',
          tokens: [
            {type: 'SEPARATOR', value: '[', start: 8, length: 1, block: ''},
            {type: 'SEPARATOR', value: '[', start: 9, length: 1, block: ''},
            {type: 'IDENTIFIER', value: 'orange', start: 10, length: 6, block: ''},
            {type: 'SEPARATOR', value: ']', start: 16, length: 1, block: ''},
          ],
          start: 8,
          length: 9,
          reasons: [new SeparatorBalanceError({value: '[', location: 8})],
          block: ''
        } ],
        tokens: [
          {type: 'SEPARATOR', value: '[', start: 0, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'apple', start: 1, length: 5, block: ''},
          {type: 'SEPARATOR', value: ']', start: 6, length: 1, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResults)
    })
    
    it(`handles one separator mismatch error`, () => {
      const str = `a ( b [ c ) d )`
      const expectedResults = {
        errors: [{
          type: 'ERROR',
          tokens: [
            {type: 'SEPARATOR', value: '[', start: 6, length: 1, block: ''},
            {type: 'IDENTIFIER', value: 'c', start: 8, length: 1, block: ''},
          ],
          start: 6,
          length: 5,
          reasons: [new SeparatorMismatchError({value: '[', location: 6}, {value: ')', location: 10})],
          block: '',
        }],
        tokens: [
          {type: 'IDENTIFIER', value: 'a', start: 0, length: 1, block: ''},
          {type: 'SEPARATOR', value: '(', start: 2, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'b', start: 4, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'd', start: 12, length: 1, block: ''},
          {type: 'SEPARATOR', value: ')', start: 14, length: 1, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResults)
    })

    it(`handles multiple separator mismatch error`, () => {
      const str = `a ( b ([ c )] d )`
      const expectedResults = {
        errors: [
          {
            type: 'ERROR',
            tokens: [
              {type: 'SEPARATOR', value: '(', start: 6, length: 1, block: ''},
              {type: 'SEPARATOR', value: '[', start: 7, length: 1, block: ''},
              {type: 'IDENTIFIER', value: 'c', start: 9, length: 1, block: ''},
            ],
            start: 6,
            length: 7,
            reasons: [
              new SeparatorMismatchError({value: '[', location: 7}, {value: ')', location: 11}),
              new SeparatorMismatchError({value: '(', location: 6}, {value: ']', location: 12}),
            ],
            block: ''
          },
        ],
        tokens: [
          {type: 'IDENTIFIER', value: 'a', start: 0, length: 1, block: ''},
          {type: 'SEPARATOR', value: '(', start: 2, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'b', start: 4, length: 1, block: ''},
          {type: 'IDENTIFIER', value: 'd', start: 14, length: 1, block: ''},
          {type: 'SEPARATOR', value: ')', start: 16, length: 1, block: ''},
        ]
      }
      expect(lexer.tokenize(str)).toEqual(expectedResults)
    })
    
  })


  //////////////////////
  //                  //
  //  HELPER METHODS  //
  //                  //
  //////////////////////
  
  describe('dedupeErrorRegions', () => {
    it('aggregates overlapping errors', () => {
      const errorRegions = [
        { start: 7, length: 5, reason: null },
        { start: 6, length: 7, reason: null }
      ]
      const expected = [{
        type: 'ERROR',
        start: 6,
        length: 7,
        reasons: [null, null],
        tokens: [],
        block: '',
      }]
      
      lexer.errorRegions = errorRegions
      lexer.dedupeErrorRegions('')
      expect(lexer.errorRegions).toEqual(expected)
    })
  })

  describe('rangeOverlaps', () => {
    it('returns false for non-overlapping regions', () => {
      const x = {start: 0, length: 1}
      const y = {start: 1, length: 1}

      expect(lexer.rangeOverlaps(x, y).overlap).toBeFalsy()
    })

    it('returns true for overlapping regions', () => {
      const x = {start: 0, length: 1}
      const y = {start: 0, length: 4}

      expect(lexer.rangeOverlaps(x, y).overlap).toBeTruthy()
    })

    it('returns true for contained regions', () => {
      const x = {start: 7, length: 5}
      const y = {start: 6, length: 7}

      expect(lexer.rangeOverlaps(x, y).overlap).toBeTruthy()
      expect(lexer.rangeOverlaps(y, x).overlap).toBeTruthy()
    })
  })
  
})
