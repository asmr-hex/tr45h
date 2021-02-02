import { keys } from 'lodash'

import { PrefixTree } from './trie'


describe('PrefixTree', () => {

  describe('.add(...)', () => {
    it('inserts a word into the tree when given a string', () => {
      const tree = new PrefixTree()
      tree.add('xanakis')
      
      expect(keys(tree.child.words)).toEqual(['x'])
      expect(keys(tree.child.words['x'].child.words)).toEqual(['a'])
      expect(keys(tree.child.words['x'].child.words['a'].child.words)).toEqual(['n'])
      expect(keys(tree.child.words['x'].child.words['a'].child.words['n'].child.words)).toEqual(['a'])
      expect(keys(tree.child.words['x'].child.words['a'].child.words['n'].child.words['a'].child.words)).toEqual(['k'])
      expect(keys(tree.child.words['x'].child.words['a'].child.words['n'].child.words['a'].child.words['k'].child.words)).toEqual(['i'])
      expect(keys(tree.child.words['x'].child.words['a'].child.words['n'].child.words['a'].child.words['k'].child.words['i'].child.words)).toEqual(['s'])
      expect(tree.child.words['x'].child.words['a'].child.words['n'].child.words['a'].child.words['k'].child.words['i'].child.words['s'].end.word).toBeTruthy()
    })

    it('inserts multiple words into the tree correctly when given consecutive strings', () => {
      const tree = new PrefixTree()
      tree.add('xanakis')
      tree.add('xanadu')
      
      expect(keys(tree.child.words)).toEqual(['x'])
      expect(keys(tree.child.words['x'].child.words)).toEqual(['a'])
      expect(keys(tree.child.words['x'].child.words['a'].child.words)).toEqual(['n'])
      expect(keys(tree.child.words['x'].child.words['a'].child.words['n'].child.words)).toEqual(['a'])
      expect(keys(tree.child.words['x'].child.words['a'].child.words['n'].child.words['a'].child.words)).toEqual(['k', 'd'])
      expect(keys(tree.child.words['x'].child.words['a'].child.words['n'].child.words['a'].child.words['k'].child.words)).toEqual(['i'])
      expect(keys(tree.child.words['x'].child.words['a'].child.words['n'].child.words['a'].child.words['d'].child.words)).toEqual(['u'])
      expect(tree.child.words['x'].child.words['a'].child.words['n'].child.words['a'].child.words['d'].child.words['u']).toBeTruthy()
      expect(keys(tree.child.words['x'].child.words['a'].child.words['n'].child.words['a'].child.words['k'].child.words['i'].child.words)).toEqual(['s'])
      expect(tree.child.words['x'].child.words['a'].child.words['n'].child.words['a'].child.words['k'].child.words['i'].child.words['s'].end.word).toBeTruthy()      
    })

    it('inserts a segment into the tree when given an array', () => {
      const tree = new PrefixTree()
      tree.add(['cin', 'quai'])

      expect(keys(tree.child.words)).toEqual(['c'])
      expect(keys(tree.child.words['c'].child.words)).toEqual(['i'])
      expect(keys(tree.child.words['c'].child.words['i'].child.words)).toEqual(['n'])
      expect(keys(tree.child.words['c'].child.words['i'].child.words['n'].child.segments)).toEqual(['q'])
      expect(keys(tree.child.words['c'].child.words['i'].child.words['n'].child.segments['q'].child.words)).toEqual(['u'])
      expect(keys(tree.child.words['c'].child.words['i'].child.words['n'].child.segments['q'].child.words['u'].child.words)).toEqual(['a'])
      expect(keys(tree.child.words['c'].child.words['i'].child.words['n'].child.segments['q'].child.words['u'].child.words['a'].child.words)).toEqual(['i'])
    })

    it('inserts multiple segments into the tree when given an consecutive arrays', () => {
      const tree = new PrefixTree()
      tree.add(['cin', 'quai'])
      tree.add(['cino', 'q'])

      expect(keys(tree.child.words)).toEqual(['c'])
      expect(keys(tree.child.words['c'].child.words)).toEqual(['i'])
      expect(keys(tree.child.words['c'].child.words['i'].child.words)).toEqual(['n'])
      expect(keys(tree.child.words['c'].child.words['i'].child.words['n'].child.words)).toEqual(['o'])
      expect(keys(tree.child.words['c'].child.words['i'].child.words['n'].child.words['o'].child.segments)).toEqual(['q'])
      expect(keys(tree.child.words['c'].child.words['i'].child.words['n'].child.words['o'].child.segments['q'].end.word)).toBeTruthy()
      expect(keys(tree.child.words['c'].child.words['i'].child.words['n'].child.segments)).toEqual(['q'])
      expect(keys(tree.child.words['c'].child.words['i'].child.words['n'].child.segments['q'].child.words)).toEqual(['u'])
      expect(keys(tree.child.words['c'].child.words['i'].child.words['n'].child.segments['q'].child.words['u'].child.words)).toEqual(['a'])
      expect(keys(tree.child.words['c'].child.words['i'].child.words['n'].child.segments['q'].child.words['u'].child.words['a'].child.words)).toEqual(['i'])
    })
  })

  describe('.remove(...)', () => {
    it.todo('removes entries')
  })
  
  describe('.suggest(...)', () => {
    it.todo('works')    
  })

})
