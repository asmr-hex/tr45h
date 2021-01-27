// import { Parser } from './parser'
// import { Lexer } from './lexer'
// import { SymbolTable } from './symbols'
// import {
//   Sequence,
//   SubBeatSequence,
//   Terminal,
//   Choice
// } from './types'



describe.skip('Parser', () => {
  const parser = new Parser(new SymbolTable())
  const lexer = new Lexer()

  describe('.analyze()', () => {
    
    describe('word and multi-word sequences', () => {
      
      it('parses a plain sound literal sequence', () => {
        const input = `apple orange pear banana`
        const blockTokens = [ lexer.tokenize(input) ]

        const expectedAST = [new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'orange', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'pear', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'banana', fx: [], ppqn: 1}),
        ])]
        
        expect(parser.analyze(blockTokens)).toEqual(expectedAST)
      })
      
      it('parses a literal sequence with multiword steps using \" quotes', () => {
        const input = `apple "orange pear" banana`
        const blockTokens = [ lexer.tokenize(input) ]
        
        const expectedAST = [new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'orange pear', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'banana', fx: [], ppqn: 1}),
        ])]
        
        expect(parser.analyze(blockTokens)).toEqual(expectedAST)
      })
      
      it('parses a literal sequence with multiword steps using \' quotes', () => {
        const input = `apple 'orange pear' banana`
        const blockTokens = [ lexer.tokenize(input) ]
        
        const expectedAST = [new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'orange pear', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'banana', fx: [], ppqn: 1}),
        ])]
        
        expect(parser.analyze(blockTokens)).toEqual(expectedAST)
      })
      
      it('parses a literal sequence with multiword steps using \' quotes and nested \" quotes', () => {
        const input = `apple 'orange "pear"' banana`
        const blockTokens = [lexer.tokenize(input)]
        
        const expectedAST = [new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'orange "pear"', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'banana', fx: [], ppqn: 1}),
        ])]
        
        expect(parser.analyze(blockTokens)).toEqual(expectedAST)
      })

      it('parses a literal sequence with multiword steps using \" quotes and nested \' quotes', () => {
        const input = `apple "orange 'pear'" banana`
        const blockTokens = [lexer.tokenize(input)]
        
        const expectedAST = [new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: `orange 'pear'`, fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'banana', fx: [], ppqn: 1}),
        ])]
        
        expect(parser.analyze(blockTokens)).toEqual(expectedAST)
      })
      
      it('parses a literal sequence with multiword steps preserving spaces inside quotes', () => {
        const input = `apple "    orange  pear " banana`
        const blockTokens = [lexer.tokenize(input)]
        
        const expectedAST = [new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: `    orange  pear `, fx: [], ppqn: 1}),
          new Terminal({type: 'sound', value: 'banana', fx: [], ppqn: 1}),
        ])]
        
        expect(parser.analyze(blockTokens)).toEqual(expectedAST)
      })
      
    })

    describe('sub-beat expressions', () => {
      it('parses a sequences with one sub-beat expression', () => {
        const input = `apple [orange banana] pear`
        const blockTokens = [lexer.tokenize(input)]

        const expectedAST = [new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new SubBeatSequence([
            new Terminal({type: 'sound', value: `orange`, fx: [], ppqn: 1}),
            new Terminal({type: 'sound', value: 'banana', fx: [], ppqn: 1}),
          ]),
          new Terminal({type: 'sound', value: `pear`, fx: [], ppqn: 1}),
        ])]

        const result = parser.analyze(blockTokens)
        expect(result).toEqual(expectedAST)
        expect(result[0].current().value).toEqual('apple')
        expect(result[0].current().ppqn).toEqual(1)
        expect(result[0].next().value).toEqual('apple')
        expect(result[0].next().ppqn).toEqual(1)

        expect(result[0].advance()).toBeFalsy()
        expect(result[0].current().value).toEqual('apple')
        expect(result[0].current().ppqn).toEqual(1)
        expect(result[0].next().value).toEqual('orange')
        expect(result[0].next().ppqn).toEqual(2)

        expect(result[0].advance()).toBeFalsy()
        expect(result[0].current().value).toEqual('orange')
        expect(result[0].current().ppqn).toEqual(2)
        expect(result[0].next().value).toEqual('banana')
        expect(result[0].next().ppqn).toEqual(2)

        expect(result[0].advance()).toBeFalsy()
        expect(result[0].current().value).toEqual('banana')
        expect(result[0].current().ppqn).toEqual(2)
        expect(result[0].next().value).toEqual('pear')
        expect(result[0].next().ppqn).toEqual(1)

        expect(result[0].advance()).toBeTruthy()
        expect(result[0].current().value).toEqual('pear')
        expect(result[0].current().ppqn).toEqual(1)
        expect(result[0].next().value).toEqual('apple')
        expect(result[0].next().ppqn).toEqual(1)
      })

      it('parses a sequences with nested sub-beat expression', () => {
        const input = `apple [orange [ banana pineapple  guava]] pear`
        const blockTokens =[lexer.tokenize(input)]

        const expectedAST = [new Sequence([
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
        ])]

        const result = parser.analyze(blockTokens)
        expect(result).toEqual(expectedAST)
        expect(result[0].current().value).toEqual('apple')
        expect(result[0].current().ppqn).toEqual(1)
        expect(result[0].next().value).toEqual('apple')
        expect(result[0].next().ppqn).toEqual(1)

        expect(result[0].advance()).toBeFalsy()
        expect(result[0].current().value).toEqual('apple')
        expect(result[0].current().ppqn).toEqual(1)
        expect(result[0].next().value).toEqual('orange')
        expect(result[0].next().ppqn).toEqual(2)

        expect(result[0].advance()).toBeFalsy()
        expect(result[0].current().value).toEqual('orange')
        expect(result[0].current().ppqn).toEqual(2)
        expect(result[0].next().value).toEqual('banana')
        expect(result[0].next().ppqn).toEqual(6)

        expect(result[0].advance()).toBeFalsy()
        expect(result[0].current().value).toEqual('banana')
        expect(result[0].current().ppqn).toEqual(6)
        expect(result[0].next().value).toEqual('pineapple')
        expect(result[0].next().ppqn).toEqual(6)

        expect(result[0].advance()).toBeFalsy()
        expect(result[0].current().value).toEqual('pineapple')
        expect(result[0].current().ppqn).toEqual(6)
        expect(result[0].next().value).toEqual('guava')
        expect(result[0].next().ppqn).toEqual(6)

        expect(result[0].advance()).toBeFalsy()
        expect(result[0].current().value).toEqual('guava')
        expect(result[0].current().ppqn).toEqual(6)
        expect(result[0].next().value).toEqual('pear')
        expect(result[0].next().ppqn).toEqual(1)

        expect(result[0].advance()).toBeTruthy()
        expect(result[0].current().value).toEqual('pear')
        expect(result[0].current().ppqn).toEqual(1)
        expect(result[0].next().value).toEqual('apple')
        expect(result[0].next().ppqn).toEqual(1)
      })

      it('ignores empty subbeat expressions', () => {
        const input = `apple [orange [] ] pear`
        const blockTokens = [lexer.tokenize(input)]

        const expectedAST = [new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new SubBeatSequence([
            new Terminal({type: 'sound', value: `orange`, fx: [], ppqn: 1}),
          ]),
          new Terminal({type: 'sound', value: `pear`, fx: [], ppqn: 1}),
        ])]

        const result = parser.analyze(blockTokens)
        expect(result).toEqual(expectedAST)
        expect(result[0].current().value).toEqual('apple')
        expect(result[0].current().ppqn).toEqual(1)
        expect(result[0].next().value).toEqual('apple')
        expect(result[0].next().ppqn).toEqual(1)

        expect(result[0].advance()).toBeFalsy()
        expect(result[0].current().value).toEqual('apple')
        expect(result[0].current().ppqn).toEqual(1)
        expect(result[0].next().value).toEqual('orange')
        expect(result[0].next().ppqn).toEqual(1)

        expect(result[0].advance()).toBeFalsy()
        expect(result[0].current().value).toEqual('orange')
        expect(result[0].current().ppqn).toEqual(1)
        expect(result[0].next().value).toEqual('pear')
        expect(result[0].next().ppqn).toEqual(1)

        expect(result[0].advance()).toBeTruthy()
        expect(result[0].current().value).toEqual('pear')
        expect(result[0].current().ppqn).toEqual(1)
        expect(result[0].next().value).toEqual('apple')
        expect(result[0].next().ppqn).toEqual(1)
      })
    })

    describe('subsequences', () => {
      it('parses a sequences with subsequences', () => {
        const input = `apple (orange banana) pear`
        const blockTokens = [lexer.tokenize(input)]

        const expectedAST = [new Sequence([
          new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
          new SubBeatSequence([
            new Terminal({type: 'sound', value: `orange`, fx: [], ppqn: 1}),
            new Terminal({type: 'sound', value: 'banana', fx: [], ppqn: 1}),
          ]),
          new Terminal({type: 'sound', value: `pear`, fx: [], ppqn: 1}),
        ])]

        const result = parser.analyze(blockTokens)
        expect(result).toEqual(expectedAST)
        expect(result[0].current().value).toEqual('apple')
        expect(result[0].current().ppqn).toEqual(1)
        expect(result[0].next().value).toEqual('apple')
        expect(result[0].next().ppqn).toEqual(1)

        expect(result[0].advance()).toBeFalsy()
        expect(result[0].current().value).toEqual('apple')
        expect(result[0].current().ppqn).toEqual(1)
        expect(result[0].next().value).toEqual('orange')
        expect(result[0].next().ppqn).toEqual(1)

        expect(result[0].advance()).toBeFalsy()
        expect(result[0].current().value).toEqual('orange')
        expect(result[0].current().ppqn).toEqual(1)
        expect(result[0].next().value).toEqual('banana')
        expect(result[0].next().ppqn).toEqual(1)

        expect(result[0].advance()).toBeFalsy()
        expect(result[0].current().value).toEqual('banana')
        expect(result[0].current().ppqn).toEqual(1)
        expect(result[0].next().value).toEqual('pear')
        expect(result[0].next().ppqn).toEqual(1)

        expect(result[0].advance()).toBeTruthy()
        expect(result[0].current().value).toEqual('pear')
        expect(result[0].current().ppqn).toEqual(1)
        expect(result[0].next().value).toEqual('apple')
        expect(result[0].next().ppqn).toEqual(1)
      })
    })

    describe('choice operator', () => {
      it('parses a sequence with a simple choice operator', () => {
        const choiceFn = (choices, cdf) => choices[0]
        const deterministicParser = new Parser(new SymbolTable(), {choiceFn})
        const input = `apple | orange`
        const blockTokens = [lexer.tokenize(input)]

        const expectedAST = [new Sequence([
          new Choice([
            new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
            new Terminal({type: 'sound', value: `orange`, fx: [], ppqn: 1}),
          ], [0.5, 0.5], choiceFn)
        ])]

        const result = deterministicParser.analyze(blockTokens)
        expect(result).toEqual(expectedAST)
      })

      it('parses a sequence with multi-choice operator', () => {
        const choiceFn = (choices, cdf) => choices[0]
        const deterministicParser = new Parser(new SymbolTable(), {choiceFn})
        const input = `apple | orange | pear | banana`
        const blockTokens = [lexer.tokenize(input)]

        const expectedAST = [new Sequence([
          new Choice([
            new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
            new Terminal({type: 'sound', value: `orange`, fx: [], ppqn: 1}),
            new Terminal({type: 'sound', value: `pear`, fx: [], ppqn: 1}),
            new Terminal({type: 'sound', value: `banana`, fx: [], ppqn: 1}),
          ], [0.25, 0.25, 0.25, 0.25], choiceFn)
        ])]

        const result = deterministicParser.analyze(blockTokens)
        expect(result).toEqual(expectedAST)
      })
    })

    describe('beat expr / sub sequences / choices interacting', () => {

      it('parses a sequence with multi-choice operator with a subsequence as a choice', () => {
        const choiceFn = (choices, cdf) => choices[0]
        const deterministicParser = new Parser(new SymbolTable(), {choiceFn})
        const input = `apple | (orange pear) | banana`
        const blockTokens = [lexer.tokenize(input)]

        const expectedAST = [new Sequence([
          new Choice([
            new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
            new Sequence([
              new Terminal({type: 'sound', value: `orange`, fx: [], ppqn: 1}),
              new Terminal({type: 'sound', value: `pear`, fx: [], ppqn: 1}),
            ]),
            new Terminal({type: 'sound', value: `banana`, fx: [], ppqn: 1}),
          ], [1/3, 1/3, 1/3], choiceFn)
        ])]

        const result = deterministicParser.analyze(blockTokens)
        expect(result).toEqual(expectedAST)
      })

      it('parses a sequence with multi-choice operator with a beat expr as a choice', () => {
        const choiceFn = (choices, cdf) => choices[0]
        const deterministicParser = new Parser(new SymbolTable(), {choiceFn})
        const input = `apple | [orange pear] | banana`
        const blockTokens = [lexer.tokenize(input)]

        const expectedAST = [new Sequence([
          new Choice([
            new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
            new SubBeatSequence([
              new Terminal({type: 'sound', value: `orange`, fx: [], ppqn: 1}),
              new Terminal({type: 'sound', value: `pear`, fx: [], ppqn: 1}),
            ]),
            new Terminal({type: 'sound', value: `banana`, fx: [], ppqn: 1}),
          ], [1/3, 1/3, 1/3], choiceFn)
        ])]

        const result = deterministicParser.analyze(blockTokens)
        expect(result).toEqual(expectedAST)
      })

      it('parses a sequence with multi-choice operator nested beat exp and choices', () => {
        const choiceFn = (choices, cdf) => choices[0]
        const deterministicParser = new Parser(new SymbolTable(), {choiceFn})
        const input = `apple | [orange (pear pear | [pineapple lime] | mango)] | banana`
        const blockTokens = [lexer.tokenize(input)]

        const expectedAST = [new Sequence([
          new Choice([
            new Terminal({type: 'sound', value: 'apple', fx: [], ppqn: 1}),
            new SubBeatSequence([
              new Terminal({type: 'sound', value: `orange`, fx: [], ppqn: 1}),
              new Sequence([
                new Terminal({type: 'sound', value: `pear`, fx: [], ppqn: 1}),
                new Choice([
                  new Terminal({type: 'sound', value: `pear`, fx: [], ppqn: 1}),
                  new SubBeatSequence([
                    new Terminal({type: 'sound', value: `pineapple`, fx: [], ppqn: 1}),
                    new Terminal({type: 'sound', value: `lime`, fx: [], ppqn: 1}),
                  ]),
                  new Terminal({type: 'sound', value: `mango`, fx: [], ppqn: 1}),
                ], [1/3, 1/3, 1/3], choiceFn)
              ])
            ]),
            new Terminal({type: 'sound', value: `banana`, fx: [], ppqn: 1}),
          ], [1/3, 1/3, 1/3], choiceFn)
        ])]

        const result = deterministicParser.analyze(blockTokens)
        expect(result).toEqual(expectedAST)
      })
    })
  })
})
