import { keys } from 'lodash'

import { PrefixTree } from './trie'


describe('PrefixTree', () => {

  describe('.add(...)', () => {
    it('inserts a word into the tree when given a string', () => {
      const tree = new PrefixTree()
      tree.add('xanakis')
      
      expect(keys(tree.next.char)).toEqual(['x'])
      expect(keys(tree.next.char['x'].next.char)).toEqual(['a'])
      expect(keys(tree.next.char['x'].next.char['a'].next.char)).toEqual(['n'])
      expect(keys(tree.next.char['x'].next.char['a'].next.char['n'].next.char)).toEqual(['a'])
      expect(keys(tree.next.char['x'].next.char['a'].next.char['n'].next.char['a'].next.char)).toEqual(['k'])
      expect(keys(tree.next.char['x'].next.char['a'].next.char['n'].next.char['a'].next.char['k'].next.char)).toEqual(['i'])
      expect(keys(tree.next.char['x'].next.char['a'].next.char['n'].next.char['a'].next.char['k'].next.char['i'].next.char)).toEqual(['s'])
      expect(tree.next.char['x'].next.char['a'].next.char['n'].next.char['a'].next.char['k'].next.char['i'].next.char['s'].end).toBeTruthy()
    })

    it('inserts multiple char into the tree correctly when given consecutive strings', () => {
      const tree = new PrefixTree()
      tree.add('xanakis')
      tree.add('xanadu')
      
      expect(keys(tree.next.char)).toEqual(['x'])
      expect(keys(tree.next.char['x'].next.char)).toEqual(['a'])
      expect(keys(tree.next.char['x'].next.char['a'].next.char)).toEqual(['n'])
      expect(keys(tree.next.char['x'].next.char['a'].next.char['n'].next.char)).toEqual(['a'])
      expect(keys(tree.next.char['x'].next.char['a'].next.char['n'].next.char['a'].next.char)).toEqual(['k', 'd'])
      expect(keys(tree.next.char['x'].next.char['a'].next.char['n'].next.char['a'].next.char['k'].next.char)).toEqual(['i'])
      expect(keys(tree.next.char['x'].next.char['a'].next.char['n'].next.char['a'].next.char['d'].next.char)).toEqual(['u'])
      expect(tree.next.char['x'].next.char['a'].next.char['n'].next.char['a'].next.char['d'].next.char['u'].end).toBeTruthy()
      expect(keys(tree.next.char['x'].next.char['a'].next.char['n'].next.char['a'].next.char['k'].next.char['i'].next.char)).toEqual(['s'])
      expect(tree.next.char['x'].next.char['a'].next.char['n'].next.char['a'].next.char['k'].next.char['i'].next.char['s'].end).toBeTruthy()      
    })
    
    it('inserts a segment into the tree when given an array', () => {
      const tree = new PrefixTree()
      tree.add(['cin', 'quai'])

      expect(keys(tree.next.char)).toEqual(['c'])
      expect(keys(tree.next.char['c'].next.char)).toEqual(['i'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char)).toEqual(['n'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.segment)).toEqual(['q'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.segment['q'].next.char)).toEqual(['u'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.segment['q'].next.char['u'].next.char)).toEqual(['a'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.segment['q'].next.char['u'].next.char['a'].next.char)).toEqual(['i'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.segment['q'].next.char['u'].next.char['a'].next.char['i'].end)).toBeTruthy()
    })

    it('inserts multiple segments into the tree when given an consecutive arrays', () => {
      const tree = new PrefixTree()
      tree.add(['cin', 'quai'])
      tree.add(['cino', 'q'])

      expect(keys(tree.next.char)).toEqual(['c'])
      expect(keys(tree.next.char['c'].next.char)).toEqual(['i'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char)).toEqual(['n'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.char)).toEqual(['o'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.char['o'].next.segment)).toEqual(['q'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.char['o'].next.segment['q'].end)).toBeTruthy()
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.segment)).toEqual(['q'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.segment['q'].next.char)).toEqual(['u'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.segment['q'].next.char['u'].next.char)).toEqual(['a'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.segment['q'].next.char['u'].next.char['a'].next.char)).toEqual(['i'])
    })

    it('gracefully handles an empty string as input', () => {
      const tree = new PrefixTree()
      tree.add('')

      expect(keys(tree.next.char)).toEqual([])
    })

    it('gracefully handles an empty array as input', () => {
      const tree = new PrefixTree()
      tree.add([])

      expect(keys(tree.next.char)).toEqual([])
      expect(keys(tree.next.segment)).toEqual([])
    })

    it('gracefully handles an array of empty strings as input (by ignoring them)', () => {
      const tree = new PrefixTree()
      tree.add(['', '', ''])

      expect(keys(tree.next.char)).toEqual([])
      expect(keys(tree.next.segment)).toEqual([])
    })

    it('gracefully handles an array containing some empty strings as input (by ignoring them)', () => {
      const tree = new PrefixTree()
      tree.add(['', 'a', ''])

      expect(keys(tree.next.char)).toEqual([])
      expect(keys(tree.next.segment)).toEqual(['a'])  // hmm idk about this.
    })
  })

  describe('.remove(...)', () => {
    it.todo('removes entries')
  })
  
  describe('.suggest(...)', () => {
    it.todo('works')    
  })

})
