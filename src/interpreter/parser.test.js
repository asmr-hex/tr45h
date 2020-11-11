import { Parser } from './parser'
import { Lexer } from './lexer'
import {
  Sequence,
  Terminal
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
          new Sequence([
            new Terminal({type: 'sound', value: `orange`, fx: [], ppqn: 2}),
            new Terminal({type: 'sound', value: 'banana', fx: [], ppqn: 2}),
          ]),
          new Terminal({type: 'sound', value: `pear`, fx: [], ppqn: 1}),
        ])
        
        expect(parser.analyze()).toEqual(expectedAST)
      })      
    })
  })
  

  // describe('program parser', () => {

  //   it('parses', () => {
  //     const tokens = [
  //       {type: Identifier, value: `apple`, position: {key: '123', line: 0, col: {start: 0, end: 4} }}
  //     ]
  //     const expectedParseTree = {
  //       statements: [
  //         {
  //           key: '123',
  //           type: 'sequence',
  //           value: [
  //             {
  //               type: 'sound',
  //               value: [
  //                 {
  //                   type: 'soundvar',
  //                   value: [
  //                     {
  //                       type: 'identifier',
  //                       value: 'apple',
  //                     }
  //                   ],
  //                 },
  //               ],
  //             },
  //             {
  //               type: 'sound',
  //               value: [
  //                 {
  //                   type: 'soundvar',
  //                   value: [
  //                     {
  //                       type: 'identifier',
  //                       value: 'pear',
  //                     }
  //                   ],
  //                 },
  //               ],
  //             },
  //             {
  //               type: 'sound',
  //               value: [
  //                 {
  //                   type: 'soundvar',
  //                   value: [
  //                     {
  //                       type: 'identifier',
  //                       value: 'banana',
  //                     }
  //                   ],
  //                 },
  //               ],
  //             }
  //           ]
  //         },
  //       ]
  //     }
  //     expect(parser.program(tokens)).toEqual(expectedParseTree)
  //   })
  // })
})
