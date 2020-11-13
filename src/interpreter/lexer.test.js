import { Lexer } from './lexer'
import {
  SeparatorBalanceError,
  SeparatorMismatchError,
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
      const expectedResult = [{type: 'NUMBER', value: 1989, start: 2, end: 5}]
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })
    it('lexes decimal numbers with > 1 digit', () => {
      const str = ' 1989.9891 '
      const expectedResult = [{type: 'NUMBER', value: 1989.9891, start: 1, end: 9}]
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })

    it('lexes sequences of identifiers', () => {
      const str = ' apple orange   pear '
      const expectedResult = [
        {type: 'IDENTIFIER', value: 'apple', start: 1, end: 5},
        {type: 'IDENTIFIER', value: 'orange', start: 7, end: 12},
        {type: 'IDENTIFIER', value: 'pear', start: 16, end: 19},
      ]
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })
    it('lexes sequences of identifiers with numbers in the names (except at beginning)', () => {
      const str = ' app13 or4nge   pe4r '
      const expectedResult = [
        {type: 'IDENTIFIER', value: 'app13', start: 1, end: 5},
        {type: 'IDENTIFIER', value: 'or4nge', start: 7, end: 12},
        {type: 'IDENTIFIER', value: 'pe4r', start: 16, end: 19},
      ]
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })
    it('lexes parenthesis', () => {
      const str = '(one two (three) )'
      const expectedResult = [
        {type: 'SEPARATOR', value: '(', start: 0, end: 0},
        {type: 'IDENTIFIER', value: 'one', start: 1, end: 3},
        {type: 'IDENTIFIER', value: 'two', start: 5, end: 7},
        {type: 'SEPARATOR', value: '(', start: 9, end: 9},
        {type: 'IDENTIFIER', value: 'three', start: 10, end: 14},
        {type: 'SEPARATOR', value: ')', start: 15, end: 15},
        {type: 'SEPARATOR', value: ')', start: 17, end: 17},
      ]
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })
    it('lexes curly brackets', () => {
      const str = '{one two {three} }'
      const expectedResult = [
        {type: 'SEPARATOR', value: '{', start: 0, end: 0},
        {type: 'IDENTIFIER', value: 'one', start: 1, end: 3},
        {type: 'IDENTIFIER', value: 'two', start: 5, end: 7},
        {type: 'SEPARATOR', value: '{', start: 9, end: 9},
        {type: 'IDENTIFIER', value: 'three', start: 10, end: 14},
        {type: 'SEPARATOR', value: '}', start: 15, end: 15},
        {type: 'SEPARATOR', value: '}', start: 17, end: 17},
      ]
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })
    it('lexes square brackets', () => {
      const str = '[one two [three] ]'
      const expectedResult = [
        {type: 'SEPARATOR', value: '[', start: 0, end: 0},
        {type: 'IDENTIFIER', value: 'one', start: 1, end: 3},
        {type: 'IDENTIFIER', value: 'two', start: 5, end: 7},
        {type: 'SEPARATOR', value: '[', start: 9, end: 9},
        {type: 'IDENTIFIER', value: 'three', start: 10, end: 14},
        {type: 'SEPARATOR', value: ']', start: 15, end: 15},
        {type: 'SEPARATOR', value: ']', start: 17, end: 17},
      ]
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })
    it('lexes single quotes', () => {
      const str = `'one two 'three' '`
      const expectedResult = [
        {type: 'QUOTE', value: '\'', start: 0, end: 0},
        {type: 'IDENTIFIER', value: 'one', start: 1, end: 3},
        {type: 'IDENTIFIER', value: 'two', start: 5, end: 7},
        {type: 'QUOTE', value: '\'', start: 9, end: 9},
        {type: 'IDENTIFIER', value: 'three', start: 10, end: 14},
        {type: 'QUOTE', value: '\'', start: 15, end: 15},
        {type: 'QUOTE', value: '\'', start: 17, end: 17},
      ]
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })
    it('lexes double quotes', () => {
      const str = `"one two "three" "`
      const expectedResult = [
        {type: 'QUOTE', value: '"', start: 0, end: 0},
        {type: 'IDENTIFIER', value: 'one', start: 1, end: 3},
        {type: 'IDENTIFIER', value: 'two', start: 5, end: 7},
        {type: 'QUOTE', value: '"', start: 9, end: 9},
        {type: 'IDENTIFIER', value: 'three', start: 10, end: 14},
        {type: 'QUOTE', value: '"', start: 15, end: 15},
        {type: 'QUOTE', value: '"', start: 17, end: 17},
      ]
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })
    it('lexes commas', () => {
      const str = `one, two,three`
      const expectedResult = [
        {type: 'IDENTIFIER', value: 'one', start: 0, end: 2},
        {type: 'SEPARATOR', value: ',', start: 3, end: 3},
        {type: 'IDENTIFIER', value: 'two', start: 5, end: 7},
        {type: 'SEPARATOR', value: ',', start: 8, end: 8},
        {type: 'IDENTIFIER', value: 'three', start: 9, end: 13},
      ]
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })

    it('lexes commas', () => {
      const str = `one, two,three`
      const expectedResult = [
        {type: 'IDENTIFIER', value: 'one', start: 0, end: 2},
        {type: 'SEPARATOR', value: ',', start: 3, end: 3},
        {type: 'IDENTIFIER', value: 'two', start: 5, end: 7},
        {type: 'SEPARATOR', value: ',', start: 8, end: 8},
        {type: 'IDENTIFIER', value: 'three', start: 9, end: 13},
      ]
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })

    it('lexes comments', () => {
      const str = `one, two,three # well this is a fine list`
      const expectedResult = [
        {type: 'IDENTIFIER', value: 'one', start: 0, end: 2},
        {type: 'SEPARATOR', value: ',', start: 3, end: 3},
        {type: 'IDENTIFIER', value: 'two', start: 5, end: 7},
        {type: 'SEPARATOR', value: ',', start: 8, end: 8},
        {type: 'IDENTIFIER', value: 'three', start: 9, end: 13},
        {type: 'COMMENT', value: '# well this is a fine list', start: 15, end: 40},
      ]
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })

    it('lexes logical OR operators', () => {
      const str = `this | that`
      const expectedResult = [
        {type: 'IDENTIFIER', value: 'this', start: 0, end: 3},
        {type: 'OPERATOR', value: '|', start: 5, end: 5},
        {type: 'IDENTIFIER', value: 'that', start: 7, end: 10},
      ]
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })

    it('lexes assignment operators', () => {
      const str = `this = something`
      const expectedResult = [
        {type: 'IDENTIFIER', value: 'this', start: 0, end: 3},
        {type: 'OPERATOR', value: '=', start: 5, end: 5},
        {type: 'IDENTIFIER', value: 'something', start: 7, end: 15},
      ]
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })

    it('lexes chaining operator', () => {
      const str = `this.reverse`
      const expectedResult = [
        {type: 'IDENTIFIER', value: 'this', start: 0, end: 3},
        {type: 'OPERATOR', value: '.', start: 4, end: 4},
        {type: 'IDENTIFIER', value: 'reverse', start: 5, end: 11},
      ]
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })

    it('lexes chaining operator after identifier with last character as a digit', () => {
      const str = `thi5.reverse`
      const expectedResult = [
        {type: 'IDENTIFIER', value: 'thi5', start: 0, end: 3},
        {type: 'OPERATOR', value: '.', start: 4, end: 4},
        {type: 'IDENTIFIER', value: 'reverse', start: 5, end: 11},
      ]
      expect(lexer.tokenize(str)).toEqual(expectedResult)
    })

    it('throws a SeparatorBalanceError when an unbalanced close parenthesis is detected', () => {
      const str = `this is wrong)`
      expect(() => lexer.tokenize(str)).toThrowError(new SeparatorBalanceError({value: ')', location: 13}))
    })

    it('throws a SeparatorBalanceError when an unbalanced close square bracket is detected', () => {
      const str = `this is wrong]`
      expect(() => lexer.tokenize(str)).toThrowError(new SeparatorBalanceError({value: ']', location: 13}))
    })

    it('throws a SeparatorBalanceError when an unbalanced open parenthesis is detected', () => {
      const str = `(this is wrong`
      expect(() => lexer.tokenize(str)).toThrowError(new SeparatorBalanceError({value: '(', location: 0}))
    })

    it('throws a SeparatorBalanceError when an unbalanced open square bracket is detected', () => {
      const str = `[this is wrong`
      expect(() => lexer.tokenize(str)).toThrowError(new SeparatorBalanceError({value: '[', location: 0}))
    })
  })
})
