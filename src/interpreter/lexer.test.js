import { Lexer } from './lexer'


describe('the lexer', () => {
  const lexer = new Lexer()

  describe('advance()', () => {
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
  
  describe('isWhitespace(c)', () => {
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

  describe('isSeparator(c)', () => {
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
    it('detects double quotes', () => {
      expect(lexer.isSeparator('"')).toBeTruthy()
    })
    it('detects single quotes', () => {
      expect(lexer.isSeparator('\'')).toBeTruthy()
    })
  })
})
