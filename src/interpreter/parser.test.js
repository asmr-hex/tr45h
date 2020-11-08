import { Parser } from './parser'
import { Terminals, NonTerminals, ContextFreeGrammar } from './cfg'

describe('the parser', () => {
  const parser = new Parser(ContextFreeGrammar)

  it('isnt tested', () => expect(true).toBeTruthy())
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
