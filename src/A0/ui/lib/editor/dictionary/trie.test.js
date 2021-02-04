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
      expect(tree.next.char['c'].next.char['i'].next.char['n'].end).toBeFalsy()
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.segment)).toEqual(['q'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.segment['q'].next.char)).toEqual(['u'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.segment['q'].next.char['u'].next.char)).toEqual(['a'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.segment['q'].next.char['u'].next.char['a'].next.char)).toEqual(['i'])
      expect(tree.next.char['c'].next.char['i'].next.char['n'].next.segment['q'].next.char['u'].next.char['a'].next.char['i'].end).toBeTruthy()
    })

    it('inserts multiple segments into the tree when given an consecutive arrays', () => {
      const tree = new PrefixTree()
      tree.add(['cin', 'quai'])
      tree.add(['cino', 'q'])

      expect(keys(tree.next.char)).toEqual(['c'])
      expect(keys(tree.next.char['c'].next.char)).toEqual(['i'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char)).toEqual(['n'])
      expect(tree.next.char['c'].next.char['i'].next.char['n'].end).toBeFalsy()
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.char)).toEqual(['o'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.char['o'].next.segment)).toEqual(['q'])
      expect(tree.next.char['c'].next.char['i'].next.char['n'].next.char['o'].end).toBeFalsy()
      expect(tree.next.char['c'].next.char['i'].next.char['n'].next.char['o'].next.segment['q'].end).toBeTruthy()
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.segment)).toEqual(['q'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.segment['q'].next.char)).toEqual(['u'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.segment['q'].next.char['u'].next.char)).toEqual(['a'])
      expect(keys(tree.next.char['c'].next.char['i'].next.char['n'].next.segment['q'].next.char['u'].next.char['a'].next.char)).toEqual(['i'])
      expect(tree.next.char['c'].next.char['i'].next.char['n'].next.segment['q'].next.char['u'].next.char['a'].next.char['i'].end).toBeTruthy()
    })

    it('inserts a segment with a redirection suggestion segment into the tree', () => {
      const tree = new PrefixTree()
      tree.add(['edit', { sound: 'symbols.sounds' }])

      expect(keys(tree.next.char)).toEqual(['e'])
      expect(keys(tree.next.char['e'].next.char)).toEqual(['d'])
      expect(keys(tree.next.char['e'].next.char['d'].next.char)).toEqual(['i'])
      expect(keys(tree.next.char['e'].next.char['d'].next.char['i'].next.char)).toEqual(['t'])
      expect(tree.next.char['e'].next.char['d'].next.char['i'].next.char['t'].end).toBeFalsy()
      expect(keys(tree.next.char['e'].next.char['d'].next.char['i'].next.char['t'].next.redirect)).toEqual(['sound'])
      expect(tree.next.char['e'].next.char['d'].next.char['i'].next.char['t'].next.redirect['sound'].end).toBeTruthy()
    })

    it('inserts a segment with multiple redirection suggestion segment into the tree', () => {
      const tree = new PrefixTree()
      tree.add(['edit', { sound: 'symbols.sounds', collection: 'collections' }])

      expect(keys(tree.next.char)).toEqual(['e'])
      expect(keys(tree.next.char['e'].next.char)).toEqual(['d'])
      expect(keys(tree.next.char['e'].next.char['d'].next.char)).toEqual(['i'])
      expect(keys(tree.next.char['e'].next.char['d'].next.char['i'].next.char)).toEqual(['t'])
      expect(tree.next.char['e'].next.char['d'].next.char['i'].next.char['t'].end).toBeFalsy()
      expect(keys(tree.next.char['e'].next.char['d'].next.char['i'].next.char['t'].next.redirect)).toEqual(['sound', 'collection'])
      expect(tree.next.char['e'].next.char['d'].next.char['i'].next.char['t'].next.redirect['sound'].end).toBeTruthy()
      expect(tree.next.char['e'].next.char['d'].next.char['i'].next.char['t'].next.redirect['collection'].end).toBeTruthy()
    })

    it('inserts a sequence of redirection suggestion segments into the tree', () => {
      const tree = new PrefixTree()
      tree.add(['ab', { sound: 'symbols.sounds' }, { collection: 'collections'} ])

      expect(keys(tree.next.char)).toEqual(['a'])
      expect(keys(tree.next.char['a'].next.char)).toEqual(['b'])
      expect(tree.next.char['a'].next.char['b'].end).toBeFalsy()
      expect(keys(tree.next.char['a'].next.char['b'].next.redirect)).toEqual(['sound'])
      expect(tree.next.char['a'].next.char['b'].next.redirect['sound'].end).toBeFalsy()
      expect(keys(tree.next.char['a'].next.char['b'].next.redirect['sound'].next.redirect)).toEqual(['collection'])
      expect(tree.next.char['a'].next.char['b'].next.redirect['sound'].next.redirect['collection'].end).toBeTruthy()
    })

    it('inserts a sequence of non-consecutive redirection suggestion segments into the tree', () => {
      const tree = new PrefixTree()
      tree.add(['ab', { sound: 'symbols.sounds' }, 'c', { collection: 'collections'} ])

      expect(keys(tree.next.char)).toEqual(['a'])
      expect(keys(tree.next.char['a'].next.char)).toEqual(['b'])
      expect(keys(tree.next.char['a'].next.char['b'].next.redirect)).toEqual(['sound'])
      expect(tree.next.char['a'].next.char['b'].end).toBeFalsy()
      expect(tree.next.char['a'].next.char['b'].next.redirect['sound'].end).toBeFalsy()
      expect(keys(tree.next.char['a'].next.char['b'].next.redirect['sound'].next.char)).toEqual(['c'])
      expect(tree.next.char['a'].next.char['b'].next.redirect['sound'].next.char['c'].end).toBeFalsy()
      expect(keys(tree.next.char['a'].next.char['b'].next.redirect['sound'].next.char['c'].next.redirect)).toEqual(['collection'])
      expect(tree.next.char['a'].next.char['b'].next.redirect['sound'].next.char['c'].next.redirect['collection'].end).toBeTruthy()
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
    it('suggests a word given a char and a trie populated with one word', () => {
      const tree = new PrefixTree()
      tree.add('starfish')

      expect(tree.suggest('s')).toEqual([ ['starfish'] ])
    })

    it('suggests a sequence given a char and a trie populated with a sequence', () => {
      const tree = new PrefixTree()
      tree.add(['become', 'empty', 'enter', 'the', 'void'])

      expect(tree.suggest('b')).toEqual([ ['become', 'empty', 'enter', 'the', 'void'] ])
    })

    it('suggests a sequence with a redirect', () => {
      const tree = new PrefixTree()
      tree.add(['edit', { sound: 'symbols.sounds' }])

      expect(tree.suggest('e')).toEqual([ ['edit', { value: 'sound', redirect: true, contexts: ['symbols.sounds']}]])
    })
  })

})
