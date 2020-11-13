import { Parser } from './parser'
import { Lexer } from './lexer'
import {
  Sequence,
  SubBeatSequence,
  Terminal,
  Choice
} from './types'


describe('Parser', () => {
  const parser = new Parser()
  const lexer = new Lexer()

  describe('.analyze()', () => {
    
    describe('word and multi-word sequences', () => {
      
      it('parses a plain sound literal sequence', () => {
        const input = `apple orange pear banana`
        parser.setTokens(lexer.tokenize(input))
        
        const expectedAST = new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'orange', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'pear', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'banana', fx: [], ppqn: 1}),
        ])
        
        expect(parser.analyze()).toEqual(expectedAST)
      })
      
      it('parses a literal sequence with multiword steps using \" quotes', () => {
        const input = `apple "orange pear" banana`
        parser.setTokens(lexer.tokenize(input))
        
        const expectedAST = new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'orange pear', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'banana', fx: [], ppqn: 1}),
        ])
        
        expect(parser.analyze()).toEqual(expectedAST)
      })
      
      it('parses a literal sequence with multiword steps using \' quotes', () => {
        const input = `apple 'orange pear' banana`
        parser.setTokens(lexer.tokenize(input))
        
        const expectedAST = new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'orange pear', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'banana', fx: [], ppqn: 1}),
        ])
        
        expect(parser.analyze()).toEqual(expectedAST)
      })
      
      it('parses a literal sequence with multiword steps using \' quotes and nested \" quotes', () => {
        const input = `apple 'orange "pear"' banana`
        parser.setTokens(lexer.tokenize(input))
        
        const expectedAST = new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'orange "pear"', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'banana', fx: [], ppqn: 1}),
        ])
        
        expect(parser.analyze()).toEqual(expectedAST)
      })

      it('parses a literal sequence with multiword steps using \" quotes and nested \' quotes', () => {
        const input = `apple "orange 'pear'" banana`
        parser.setTokens(lexer.tokenize(input))
        
        const expectedAST = new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: `orange 'pear'`, fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'banana', fx: [], ppqn: 1}),
        ])
        
        expect(parser.analyze()).toEqual(expectedAST)
      })
      
      it('parses a literal sequence with multiword steps preserving spaces inside quotes', () => {
        const input = `apple "    orange  pear " banana`
        parser.setTokens(lexer.tokenize(input))
        
        const expectedAST = new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: `    orange  pear `, fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'banana', fx: [], ppqn: 1}),
        ])
        
        expect(parser.analyze()).toEqual(expectedAST)
      })
      
    })

    describe('sub-beat expressions', () => {
      it('parses a sequences with one sub-beat expression', () => {
        const input = `apple [orange banana] pear`
        parser.setTokens(lexer.tokenize(input))

        const expectedAST = new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new SubBeatSequence([
            new Terminal({type: 'sound', value: `orange`, fx: [], ppqn: 1}),
            new Terminal({type: 'sound', value: 'banana', fx: [], ppqn: 1}),
          ]),
          new Terminal({type: 'sound', value: `pear`, fx: [], ppqn: 1}),
        ])

        const result = parser.analyze()
        expect(result).toEqual(expectedAST)
        expect(result.current().value).toEqual('apple')
        expect(result.current().ppqn).toEqual(1)
        expect(result.next().value).toEqual('apple')
        expect(result.next().ppqn).toEqual(1)

        expect(result.advance()).toBeFalsy()
        expect(result.current().value).toEqual('apple')
        expect(result.current().ppqn).toEqual(1)
        expect(result.next().value).toEqual('orange')
        expect(result.next().ppqn).toEqual(2)

        expect(result.advance()).toBeFalsy()
        expect(result.current().value).toEqual('orange')
        expect(result.current().ppqn).toEqual(2)
        expect(result.next().value).toEqual('banana')
        expect(result.next().ppqn).toEqual(2)

        expect(result.advance()).toBeFalsy()
        expect(result.current().value).toEqual('banana')
        expect(result.current().ppqn).toEqual(2)
        expect(result.next().value).toEqual('pear')
        expect(result.next().ppqn).toEqual(1)

        expect(result.advance()).toBeTruthy()
        expect(result.current().value).toEqual('pear')
        expect(result.current().ppqn).toEqual(1)
        expect(result.next().value).toEqual('apple')
        expect(result.next().ppqn).toEqual(1)
      })

      it('parses a sequences with nested sub-beat expression', () => {
        const input = `apple [orange [ banana pineapple  guava]] pear`
        parser.setTokens(lexer.tokenize(input))

        const expectedAST = new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new SubBeatSequence([
            new Terminal({type: 'sound', value: `orange`, fx: [], ppqn: 1}),
            new SubBeatSequence([
              new Terminal({type: 'sound', value: 'banana', fx: [], ppqn: 1}),
              new Terminal({type: 'sound', value: `pineapple`, fx: [], ppqn: 1}),
              new Terminal({type: 'sound', value: `guava`, fx: [], ppqn: 1}),
            ])
          ]),
          new Terminal({type: 'sound', value: `pear`, fx: [], ppqn: 1}),
        ])

        const result = parser.analyze()
        expect(result).toEqual(expectedAST)
        expect(result.current().value).toEqual('apple')
        expect(result.current().ppqn).toEqual(1)
        expect(result.next().value).toEqual('apple')
        expect(result.next().ppqn).toEqual(1)

        expect(result.advance()).toBeFalsy()
        expect(result.current().value).toEqual('apple')
        expect(result.current().ppqn).toEqual(1)
        expect(result.next().value).toEqual('orange')
        expect(result.next().ppqn).toEqual(2)

        expect(result.advance()).toBeFalsy()
        expect(result.current().value).toEqual('orange')
        expect(result.current().ppqn).toEqual(2)
        expect(result.next().value).toEqual('banana')
        expect(result.next().ppqn).toEqual(6)

        expect(result.advance()).toBeFalsy()
        expect(result.current().value).toEqual('banana')
        expect(result.current().ppqn).toEqual(6)
        expect(result.next().value).toEqual('pineapple')
        expect(result.next().ppqn).toEqual(6)

        expect(result.advance()).toBeFalsy()
        expect(result.current().value).toEqual('pineapple')
        expect(result.current().ppqn).toEqual(6)
        expect(result.next().value).toEqual('guava')
        expect(result.next().ppqn).toEqual(6)

        expect(result.advance()).toBeFalsy()
        expect(result.current().value).toEqual('guava')
        expect(result.current().ppqn).toEqual(6)
        expect(result.next().value).toEqual('pear')
        expect(result.next().ppqn).toEqual(1)

        expect(result.advance()).toBeTruthy()
        expect(result.current().value).toEqual('pear')
        expect(result.current().ppqn).toEqual(1)
        expect(result.next().value).toEqual('apple')
        expect(result.next().ppqn).toEqual(1)
      })

      it('ignores empty subbeat expressions', () => {
        const input = `apple [orange [] ] pear`
        parser.setTokens(lexer.tokenize(input))

        const expectedAST = new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new SubBeatSequence([
            new Terminal({type: 'sound', value: `orange`, fx: [], ppqn: 1}),
          ]),
          new Terminal({type: 'sound', value: `pear`, fx: [], ppqn: 1}),
        ])

        const result = parser.analyze()
        expect(result).toEqual(expectedAST)
        expect(result.current().value).toEqual('apple')
        expect(result.current().ppqn).toEqual(1)
        expect(result.next().value).toEqual('apple')
        expect(result.next().ppqn).toEqual(1)

        expect(result.advance()).toBeFalsy()
        expect(result.current().value).toEqual('apple')
        expect(result.current().ppqn).toEqual(1)
        expect(result.next().value).toEqual('orange')
        expect(result.next().ppqn).toEqual(1)

        expect(result.advance()).toBeFalsy()
        expect(result.current().value).toEqual('orange')
        expect(result.current().ppqn).toEqual(1)
        expect(result.next().value).toEqual('pear')
        expect(result.next().ppqn).toEqual(1)

        expect(result.advance()).toBeTruthy()
        expect(result.current().value).toEqual('pear')
        expect(result.current().ppqn).toEqual(1)
        expect(result.next().value).toEqual('apple')
        expect(result.next().ppqn).toEqual(1)
      })
    })

    describe('subsequences', () => {
      it('parses a sequences with subsequences', () => {
        const input = `apple (orange banana) pear`
        parser.setTokens(lexer.tokenize(input))

        const expectedAST = new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new SubBeatSequence([
            new Terminal({type: 'sound', value: `orange`, fx: [], ppqn: 1}),
            new Terminal({type: 'sound', value: 'banana', fx: [], ppqn: 1}),
          ]),
          new Terminal({type: 'sound', value: `pear`, fx: [], ppqn: 1}),
        ])

        const result = parser.analyze()
        expect(result).toEqual(expectedAST)
        expect(result.current().value).toEqual('apple')
        expect(result.current().ppqn).toEqual(1)
        expect(result.next().value).toEqual('apple')
        expect(result.next().ppqn).toEqual(1)

        expect(result.advance()).toBeFalsy()
        expect(result.current().value).toEqual('apple')
        expect(result.current().ppqn).toEqual(1)
        expect(result.next().value).toEqual('orange')
        expect(result.next().ppqn).toEqual(1)

        expect(result.advance()).toBeFalsy()
        expect(result.current().value).toEqual('orange')
        expect(result.current().ppqn).toEqual(1)
        expect(result.next().value).toEqual('banana')
        expect(result.next().ppqn).toEqual(1)

        expect(result.advance()).toBeFalsy()
        expect(result.current().value).toEqual('banana')
        expect(result.current().ppqn).toEqual(1)
        expect(result.next().value).toEqual('pear')
        expect(result.next().ppqn).toEqual(1)

        expect(result.advance()).toBeTruthy()
        expect(result.current().value).toEqual('pear')
        expect(result.current().ppqn).toEqual(1)
        expect(result.next().value).toEqual('apple')
        expect(result.next().ppqn).toEqual(1)
      })
    })

    describe('choice operator', () => {
      it('parses a sequence with a simple choice operator', () => {
        const choiceFn = (choices, cdf) => choices[0]
        const deterministicParser = new Parser({choiceFn})
        const input = `apple | orange`
        deterministicParser.setTokens(lexer.tokenize(input))

        const expectedAST = new Sequence([
          new Choice([
            new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
            new Terminal({type: 'sound', value: `orange`, fx: [], ppqn: 1}),
          ], [0.5, 0.5], choiceFn)
        ])

        const result = deterministicParser.analyze()
        expect(result).toEqual(expectedAST)
      })
    })
  })
})
