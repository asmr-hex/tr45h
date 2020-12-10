import {
  ASTNode,
  Terminal,
  Sequence,
  SubBeatSequence,
  Choice,
} from './nodes'
import { NotImplementedError } from '../error'


describe('language types', () => {

  describe('ASTNode', () => {
    it('sets _current === _next on initialization', () => {
      const node = new ASTNode({type: 'sound',value: 'some sound',fx: [],ppqn: 32})
      expect(node.current()).toEqual(node.next())
    })

    it('throws NotImplementedError if calling advance', () => {
      const node = new ASTNode({type: 'sound',value: 'some sound',fx: [],ppqn: 32})
      expect(() => node.advance()).toThrowError(new NotImplementedError('advance()'))
    })
  })

  describe('Terminal', () => {
    it('sets _current === _next on initialization', () => {
      const node = new Terminal({type: 'sound',value: 'some sound',fx: [],ppqn: 32})
      expect(node.current()).toEqual(node.next())
    })

    it('always cycles on advance', () => {
      const node = new Terminal({type: 'sound',value: 'some sound',fx: [],ppqn: 32})
      expect(node.advance()).toBeTruthy()
      expect(node.advance()).toBeTruthy()
      expect(node.advance()).toBeTruthy()
      expect(node.advance()).toBeTruthy()
    })

    it('always has the same current and next steps', () => {
      const node = new Terminal({type: 'sound',value: 'some sound',fx: [],ppqn: 32})
      expect(node.advance()).toBeTruthy()
      expect(node.current()).toEqual(node.next())
      expect(node.advance()).toBeTruthy()
      expect(node.current()).toEqual(node.next())
      expect(node.advance()).toBeTruthy()
      expect(node.current()).toEqual(node.next())
      expect(node.advance()).toBeTruthy()
      expect(node.current()).toEqual(node.next())
    })
  })

  describe('Sequence', () => {
    it('advances properly with Terminal sequence', () => {
      const sequence = new Sequence([
        new Terminal({type: 'sound',value: 'A',fx: [],ppqn: 16}),
        new Terminal({type: 'sound',value: 'B',fx: [],ppqn: 8}),
        new Terminal({type: 'sound',value: 'C',fx: [],ppqn: 32})
      ])

      expect(sequence.current().value).toEqual('A')
      expect(sequence.current()).toEqual(sequence.next())
      
      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('A')
      expect(sequence.next().value).toEqual('B')

      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('B')
      expect(sequence.next().value).toEqual('C')

      expect(sequence.advance()).toBeTruthy()
      expect(sequence.current().value).toEqual('C')
      expect(sequence.next().value).toEqual('A')
    })

    it('advances properly with sub-Sequence sequence', () => {
      const sequence = new Sequence([
        new Sequence([
          new Terminal({type: 'sound',value: 'A',fx: [],ppqn: 16}),
          new Terminal({type: 'sound',value: 'B',fx: [],ppqn: 32})
        ]),
        new Sequence([
          new Terminal({type: 'sound',value: 'C',fx: [],ppqn: 16}),
          new Terminal({type: 'sound',value: 'D',fx: [],ppqn: 8}),
          new Terminal({type: 'sound',value: 'E',fx: [],ppqn: 32})
        ]),
        new Terminal({type: 'sound',value: 'F',fx: [],ppqn: 16}),
      ])

      expect(sequence.current().value).toEqual('A')
      expect(sequence.current()).toEqual(sequence.next())
      
      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('A')
      expect(sequence.next().value).toEqual('B')

      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('B')
      expect(sequence.next().value).toEqual('C')

      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('C')
      expect(sequence.next().value).toEqual('D')

      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('D')
      expect(sequence.next().value).toEqual('E')

      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('E')
      expect(sequence.next().value).toEqual('F')

      expect(sequence.advance()).toBeTruthy()
      expect(sequence.current().value).toEqual('F')
      expect(sequence.next().value).toEqual('A')
    })

    it('advances properly with nested sub-Sequence sequence', () => {
      const sequence = new Sequence([
        new Sequence([
          new Terminal({type: 'sound',value: 'A',fx: [],ppqn: 16}),
          new Sequence([
            new Terminal({type: 'sound',value: 'B',fx: [],ppqn: 16}),
            new Sequence([
              new Terminal({type: 'sound',value: 'C',fx: [],ppqn: 16}),
              new Terminal({type: 'sound',value: 'D',fx: [],ppqn: 8}),
              new Terminal({type: 'sound',value: 'E',fx: [],ppqn: 32})
            ]),
          ]),
        ]),
        new Sequence([
          new Terminal({type: 'sound',value: 'F',fx: [],ppqn: 16}),
          new Terminal({type: 'sound',value: 'G',fx: [],ppqn: 8}),
          new Terminal({type: 'sound',value: 'H',fx: [],ppqn: 32})
        ]),
        new Terminal({type: 'sound',value: 'I',fx: [],ppqn: 16}),
      ])

      expect(sequence.current().value).toEqual('A')
      expect(sequence.current()).toEqual(sequence.next())
      
      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('A')
      expect(sequence.next().value).toEqual('B')

      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('B')
      expect(sequence.next().value).toEqual('C')

      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('C')
      expect(sequence.next().value).toEqual('D')

      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('D')
      expect(sequence.next().value).toEqual('E')

      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('E')
      expect(sequence.next().value).toEqual('F')

      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('F')
      expect(sequence.next().value).toEqual('G')

      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('G')
      expect(sequence.next().value).toEqual('H')

      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('H')
      expect(sequence.next().value).toEqual('I')
      
      expect(sequence.advance()).toBeTruthy()
      expect(sequence.current().value).toEqual('I')
      expect(sequence.next().value).toEqual('A')
    })
  })

  describe('SubBeatSequence', () => {
    it('resolves ppqn for Terminal sequences', () => {
      const subbeat = new SubBeatSequence([
        new Terminal({type: 'sound', value: 'A', fx: [], ppqn: 1}),
        new Terminal({type: 'sound', value: 'B', fx: [], ppqn: 2}),
        new Terminal({type: 'sound', value: 'C', fx: [], ppqn: 3})
      ])

      expect(subbeat.current().ppqn).toEqual(3)
      expect(subbeat.next().ppqn).toEqual(3)

      expect(subbeat.advance()).toBeFalsy()
      expect(subbeat.current().ppqn).toEqual(3)
      expect(subbeat.next().ppqn).toEqual(6)

      expect(subbeat.advance()).toBeFalsy()
      expect(subbeat.current().ppqn).toEqual(6)
      expect(subbeat.next().ppqn).toEqual(9)

      expect(subbeat.advance()).toBeTruthy()
      expect(subbeat.current().ppqn).toEqual(9)
      expect(subbeat.next().ppqn).toEqual(3)
    })

    it('resolves ppqn for sequences with nested sub beats', () => {
      const subbeat = new SubBeatSequence([
        new Terminal({type: 'sound', value: 'A', fx: [], ppqn: 1}),
        new SubBeatSequence([
          new Terminal({type: 'sound', value: 'B', fx: [], ppqn: 2}),
          new Terminal({type: 'sound', value: 'C', fx: [], ppqn: 3}),
        ]),
        new Terminal({type: 'sound', value: 'D', fx: [], ppqn: 4}),
      ])

      expect(subbeat.current().ppqn).toEqual(3)
      expect(subbeat.next().ppqn).toEqual(3)

      expect(subbeat.advance()).toBeFalsy()
      expect(subbeat.current().ppqn).toEqual(3)
      expect(subbeat.next().ppqn).toEqual(12)

      expect(subbeat.advance()).toBeFalsy()
      expect(subbeat.current().ppqn).toEqual(12)
      expect(subbeat.next().ppqn).toEqual(18)

      expect(subbeat.advance()).toBeFalsy()
      expect(subbeat.current().ppqn).toEqual(18)
      expect(subbeat.next().ppqn).toEqual(12)
      
      expect(subbeat.advance()).toBeTruthy()
      expect(subbeat.current().ppqn).toEqual(12)
      expect(subbeat.next().ppqn).toEqual(3)
    })
  })
  
  describe('Choice', () => {
    it('randomly chooses an initial choice', () => {
      const choiceFn = (choices, cdf) => choices[2]
      const choice = new Choice([
        new Terminal({type: 'sound',value: 'A',fx: [],ppqn: 32}),
        new Terminal({type: 'sound',value: 'B',fx: [],ppqn: 32}),
        new Terminal({type: 'sound',value: 'C',fx: [],ppqn: 32}),
        new Terminal({type: 'sound',value: 'D',fx: [],ppqn: 32}),
      ], [0.5, 0.1, 0.2, 0.2], choiceFn)

      expect(choice.current().value).toEqual('C')
    })

    it('randomly chooses a new choice when advanced', () => {
      let i = 0
      const choiceFn = (choices, cdf) => {
        const prand = [2, 0, 2, 1, 3]
        return choices[prand[i++]]
      }
      const choice = new Choice([
        new Terminal({type: 'sound',value: 'A',fx: [],ppqn: 32}),
        new Terminal({type: 'sound',value: 'B',fx: [],ppqn: 32}),
        new Terminal({type: 'sound',value: 'C',fx: [],ppqn: 32}),
        new Terminal({type: 'sound',value: 'D',fx: [],ppqn: 32}),
      ], [0.5, 0.1, 0.2, 0.2], choiceFn)

      expect(choice.current().value).toEqual('C')

      expect(choice.advance()).toBeTruthy()
      expect(choice.current().value).toEqual('C')
      expect(choice.next().value).toEqual('A')

      expect(choice.advance()).toBeTruthy()
      expect(choice.current().value).toEqual('A')
      expect(choice.next().value).toEqual('C')

      expect(choice.advance()).toBeTruthy()
      expect(choice.current().value).toEqual('C')
      expect(choice.next().value).toEqual('B')

      expect(choice.advance()).toBeTruthy()
      expect(choice.current().value).toEqual('B')
      expect(choice.next().value).toEqual('D')
    })
  })

  describe('Sequence and Choice interacting', () => {

    it('randomly selects a sequence (choice of sequences)', () => {
      let i = 0
      const choiceFn = (choices, cdf) => {
        const prand = [2, 1, 0, 0]
        return choices[prand[i++]]
      }
      const choice = new Choice([
        new Sequence([
          new Terminal({type: 'sound',value: 'A',fx: [],ppqn: 16}),
          new Terminal({type: 'sound',value: 'B',fx: [],ppqn: 32})
        ]),
        new Sequence([
          new Terminal({type: 'sound',value: 'C',fx: [],ppqn: 16}),
          new Terminal({type: 'sound',value: 'D',fx: [],ppqn: 8}),
          new Sequence([
            new Terminal({type: 'sound',value: 'E',fx: [],ppqn: 16}),
            new Terminal({type: 'sound',value: 'F',fx: [],ppqn: 32})
          ]),
        ]),
        new Terminal({type: 'sound',value: 'G',fx: [],ppqn: 16}),
      ], [0.5, 0.1, 0.2, 0.2], choiceFn)

      expect(choice.current().value).toEqual('G')

      expect(choice.advance()).toBeTruthy()
      expect(choice.current().value).toEqual('G')
      expect(choice.next().value).toEqual('C')

      expect(choice.advance()).toBeFalsy()
      expect(choice.current().value).toEqual('C')
      expect(choice.next().value).toEqual('D')

      expect(choice.advance()).toBeFalsy()
      expect(choice.current().value).toEqual('D')
      expect(choice.next().value).toEqual('E')

      expect(choice.advance()).toBeFalsy()
      expect(choice.current().value).toEqual('E')
      expect(choice.next().value).toEqual('F')

      expect(choice.advance()).toBeTruthy()
      expect(choice.current().value).toEqual('F')
      expect(choice.next().value).toEqual('A')

      expect(choice.advance()).toBeFalsy()
      expect(choice.current().value).toEqual('A')
      expect(choice.next().value).toEqual('B')

      expect(choice.advance()).toBeTruthy()
      expect(choice.current().value).toEqual('B')
      expect(choice.next().value).toEqual('A')
    })

    it('sequences random choices (sequence of choices)', () => {
      const sequence = new Sequence([
        new Choice([
          new Terminal({type: 'sound',value: 'A',fx: [],ppqn: 32}),
          new Terminal({type: 'sound',value: 'B',fx: [],ppqn: 32}),
          new Terminal({type: 'sound',value: 'C',fx: [],ppqn: 32}),
          new Terminal({type: 'sound',value: 'D',fx: [],ppqn: 32}),
        ], [0.5, 0.1, 0.2, 0.2], (i => (choices, cdf) => {
          const prand = [2, 0, 1, 3, 0]
          return choices[prand[i++]]
        })(0)),
        new Choice([
          new Terminal({type: 'sound',value: 'E',fx: [],ppqn: 32}),
          new Terminal({type: 'sound',value: 'F',fx: [],ppqn: 32}),
        ], [0.5, 0.5], (i => (choices, cdf) => {
          const prand = [0, 1, 0, 0]
          return choices[prand[i++]]
        })(0)),
      ])

      expect(sequence.current().value).toEqual('C')

      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('C')
      expect(sequence.next().value).toEqual('E')

      expect(sequence.advance()).toBeTruthy()
      expect(sequence.current().value).toEqual('E')
      expect(sequence.next().value).toEqual('A')

      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('A')
      expect(sequence.next().value).toEqual('F')

      expect(sequence.advance()).toBeTruthy()
      expect(sequence.current().value).toEqual('F')
      expect(sequence.next().value).toEqual('B')

      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('B')
      expect(sequence.next().value).toEqual('E')

      expect(sequence.advance()).toBeTruthy()
      expect(sequence.current().value).toEqual('E')
      expect(sequence.next().value).toEqual('D')

      expect(sequence.advance()).toBeFalsy()
      expect(sequence.current().value).toEqual('D')
      expect(sequence.next().value).toEqual('E')
    })
  })
})
