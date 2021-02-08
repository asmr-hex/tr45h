import { keys } from 'lodash'

import { Dictionary } from './index'
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

    it('inserts a longer segment into the tree given an array', () => {
      const tree = new PrefixTree()
      tree.add(['become', 'empty', 'enter'])

      expect(keys(tree.next.char)).toEqual(['b'])
      expect(keys(tree.next.char['b'].next.char)).toEqual(['e'])
      expect(keys(tree.next.char['b'].next.char['e'].next.char)).toEqual(['c'])
      expect(keys(tree.next.char['b'].next.char['e'].next.char['c'].next.char)).toEqual(['o'])
      expect(keys(tree.next.char['b'].next.char['e'].next.char['c'].next.char['o'].next.char)).toEqual(['m'])
      expect(keys(tree.next.char['b'].next.char['e'].next.char['c'].next.char['o'].next.char['m'].next.char)).toEqual(['e'])
      expect(tree.next.char['b'].next.char['e'].next.char['c'].next.char['o'].next.char['m'].next.char['e'].end).toBeFalsy()

      expect(keys(tree.next.char['b'].next.char['e'].next.char['c'].next.char['o'].next.char['m'].next.char['e'].next.segment)).toEqual(['e'])
      expect(keys(tree.next.char['b'].next.char['e'].next.char['c'].next.char['o'].next.char['m'].next.char['e'].next.segment['e'].next.char)).toEqual(['m'])
      expect(keys(tree.next.char['b'].next.char['e'].next.char['c'].next.char['o'].next.char['m'].next.char['e'].next.segment['e'].next.char['m'].next.char)).toEqual(['p'])
      expect(keys(tree.next.char['b'].next.char['e'].next.char['c'].next.char['o'].next.char['m'].next.char['e'].next.segment['e'].next.char['m'].next.char['p'].next.char)).toEqual(['t'])
      expect(keys(tree.next.char['b'].next.char['e'].next.char['c'].next.char['o'].next.char['m'].next.char['e'].next.segment['e'].next.char['m'].next.char['p'].next.char['t'].next.char)).toEqual(['y'])
      expect(tree.next.char['b'].next.char['e'].next.char['c'].next.char['o'].next.char['m'].next.char['e'].next.segment['e'].next.char['m'].next.char['p'].next.char['t'].next.char['y'].end).toBeFalsy()

      expect(keys(tree.next.char['b'].next.char['e'].next.char['c'].next.char['o'].next.char['m'].next.char['e'].next.segment['e'].next.char['m'].next.char['p'].next.char['t'].next.char['y'].next.segment)).toEqual(['e'])
      expect(keys(tree.next.char['b'].next.char['e'].next.char['c'].next.char['o'].next.char['m'].next.char['e'].next.segment['e'].next.char['m'].next.char['p'].next.char['t'].next.char['y'].next.segment['e'].next.char)).toEqual(['n'])
      expect(keys(tree.next.char['b'].next.char['e'].next.char['c'].next.char['o'].next.char['m'].next.char['e'].next.segment['e'].next.char['m'].next.char['p'].next.char['t'].next.char['y'].next.segment['e'].next.char['n'].next.char)).toEqual(['t'])
      expect(keys(tree.next.char['b'].next.char['e'].next.char['c'].next.char['o'].next.char['m'].next.char['e'].next.segment['e'].next.char['m'].next.char['p'].next.char['t'].next.char['y'].next.segment['e'].next.char['n'].next.char['t'].next.char)).toEqual(['e'])
      expect(keys(tree.next.char['b'].next.char['e'].next.char['c'].next.char['o'].next.char['m'].next.char['e'].next.segment['e'].next.char['m'].next.char['p'].next.char['t'].next.char['y'].next.segment['e'].next.char['n'].next.char['t'].next.char['e'].next.char)).toEqual(['r'])
      expect(tree.next.char['b'].next.char['e'].next.char['c'].next.char['o'].next.char['m'].next.char['e'].next.segment['e'].next.char['m'].next.char['p'].next.char['t'].next.char['y'].next.segment['e'].next.char['n'].next.char['t'].next.char['e'].next.char['r'].end).toBeTruthy()
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

    it('inserts a segment with a redirection suggestion segment as the first segment into the tree', () => {
      const tree = new PrefixTree()
      tree.add([{ sound: 'symbols.sounds' }])

      expect(keys(tree.next.redirect)).toEqual(['sound'])
      expect(tree.next.redirect['sound'].end).toBeTruthy()
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
      expect(keys(tree.next.char['a'].next.char['b'].next.redirect['sound'].next.segment)).toEqual(['c'])
      expect(tree.next.char['a'].next.char['b'].next.redirect['sound'].next.segment['c'].end).toBeFalsy()
      expect(keys(tree.next.char['a'].next.char['b'].next.redirect['sound'].next.segment['c'].next.redirect)).toEqual(['collection'])
      expect(tree.next.char['a'].next.char['b'].next.redirect['sound'].next.segment['c'].next.redirect['collection'].end).toBeTruthy()
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

  describe('.getMatchingWord(...)', () => {
    it('returns the matching node given a partial word match', () => {
      const tree = new PrefixTree()
      tree.add('starfish')

      expect(tree.getMatchingWord('s', tree)).toEqual(tree.next.char['s'])
    })

    it('returns null given a non-word match', () => {
      const tree = new PrefixTree()
      tree.add('starfish')

      expect(tree.getMatchingWord('n', tree)).toEqual(null)
    })
  })
  
  describe('.getMatches(...)', () => {
    it('matches on a partially completed word', () => {
      const tree = new PrefixTree()
      tree.add('starfish')

      expect(tree.getMatches(['s'], tree, null)).toEqual([ [ tree.next.char['s'] ] ])
    })

    it('matches on a completed word', () => {
      const tree = new PrefixTree()
      tree.add('sea')

      expect(tree.getMatches(['sea'], tree, null)).toEqual([ [ tree.next.char['s'].next.char['e'].next.char['a'] ] ])
    })

    it('returns an empty array for an invalid word', () => {
      const tree = new PrefixTree()
      tree.add('sea')

      expect(tree.getMatches(['si'], tree, null)).toEqual([])
    })

    it('matches on a partial phrase', () => {
      const tree = new PrefixTree()
      tree.add(['sea', 'cucumber'])

      expect(tree.getMatches(['sea', 'c'], tree, null)).toEqual([ [ tree.next.char['s'].next.char['e'].next.char['a'].next.segment['c'] ] ])
    })

    it('matches on a complete phrase', () => {
      const tree = new PrefixTree()
      tree.add(['sea', 'bee'])

      expect(tree.getMatches(['sea', 'bee'], tree, null)).toEqual([ [ tree.next.char['s'].next.char['e'].next.char['a'].next.segment['b'].next.char['e'].next.char['e'] ] ])
    })

    it('returns an empty array for an invalid phrase', () => {
      const tree = new PrefixTree()
      tree.add(['sea', 'bee'])

      expect(tree.getMatches(['sea', 'bea'], tree, null)).toEqual([])
    })

    it('matches on a partial redirect (redirect as first segment)', () => {
      const dictionary = new Dictionary()
      dictionary.new('critter', ['bug', 'fish'])
      
      const tree = new PrefixTree()
      tree.add([{ animal: ['critter'] }])
      
      expect(tree.getMatches(['b'], tree, dictionary)).toEqual([ [tree.next.redirect['animal'], dictionary.get('critter').next.char['b'] ] ])
    })

    it('matches on a complete redirect (redirect as first segment) with remainder at the top level', () => {
      const dictionary = new Dictionary()
      dictionary.new('critter', ['bug'])
      
      const tree = new PrefixTree()
      tree.add([{ animal: ['critter'] }, 'dance'])
      
      expect(tree.getMatches(['bug', 'da'], tree, dictionary)).toEqual([
        [ tree.next.redirect['animal'].next.segment['d'].next.char['a'] ]
      ])
    })

    it('matches on a complete redirect (redirect as first segment) as well as a partial match on the redirect and with remainder at the top level', () => {
      const dictionary = new Dictionary()
      dictionary.new('critter', ['bug', ['bug', 'dance']])
      
      const tree = new PrefixTree()
      tree.add([{ animal: ['critter'] }, 'dance'])
      
      expect(tree.getMatches(['bug', 'da'], tree, dictionary)).toEqual([
        [ tree.next.redirect['animal'].next.segment['d'].next.char['a'] ],
        [ tree.next.redirect['animal'], dictionary.get('critter').next.char['b'].next.char['u'].next.char['g'].next.segment['d'].next.char['a'] ]
      ])
    })
    
    it('matches on a partial redirect', () => {
      const dictionary = new Dictionary()
      dictionary.new('critter', ['bug', 'fish'])
      
      const tree = new PrefixTree()
      tree.add(['a', { animal: ['critter'] }])
      
      expect(tree.getMatches(['a', 'b'], tree, dictionary)).toEqual([ [tree.next.char['a'].next.redirect['animal'], dictionary.get('critter').next.char['b'] ] ])
    })

    it('matches on a partial nested redirect', () => {
      const dictionary = new Dictionary()
      dictionary.new('insects', ['ant', 'arachnid'])
      dictionary.new('critter', [['bug', {kind: 'insects'}], 'fish'])
      
      const tree = new PrefixTree()
      tree.add(['a', { animal: ['critter'] }])
      
      expect(tree.getMatches(['a', 'bug', 'a'], tree, dictionary)).toEqual([
        [
          tree.next.char['a'].next.redirect['animal'],
          dictionary.get('critter').next.char['b'].next.char['u'].next.char['g'].next.redirect['kind'],
          dictionary.get('insects').next.char['a'],
        ]
      ])
    })

    it('matches on a fully qualified nested redirect', () => {
      const dictionary = new Dictionary()
      dictionary.new('insects', ['a'])
      dictionary.new('critter', [['bug', {kind: 'insects'}], 'fish'])
      
      const tree = new PrefixTree()
      tree.add(['a', { animal: ['critter'] }])
      
      expect(tree.getMatches(['a', 'bug', 'a'], tree, dictionary)).toEqual([
        [
          tree.next.char['a'].next.redirect['animal'],
          dictionary.get('critter').next.char['b'].next.char['u'].next.char['g'].next.redirect['kind'],
          dictionary.get('insects').next.char['a'],
        ]
      ])
    })
    
    it('matches on a fully qualified nested redirect (with more potential completions in the nested context)', () => {
      const dictionary = new Dictionary()
      dictionary.new('insects', ['a', 'arachnid'])
      dictionary.new('critter', [['bug', {kind: 'insects'}], 'fish'])
      
      const tree = new PrefixTree()
      tree.add(['a', { animal: ['critter'] }])
      
      expect(tree.getMatches(['a', 'bug', 'a'], tree, dictionary)).toEqual([
        [
          tree.next.char['a'].next.redirect['animal'],
          dictionary.get('critter').next.char['b'].next.char['u'].next.char['g'].next.redirect['kind'],
          dictionary.get('insects').next.char['a'], // because we WANT to include arachnid in the autosuggestions.
        ]
      ])
    })

    it('matches on a fully qualified nested redirect with a remainder on the top context', () => {
      const dictionary = new Dictionary()
      dictionary.new('insects', ['a', 'arachnid'])
      dictionary.new('critter', [['bug', {kind: 'insects'}], 'fish'])
      
      const tree = new PrefixTree()
      tree.add(['a', { animal: ['critter'] }, 'flower'])
      
      expect(tree.getMatches(['a', 'bug', 'a', 'f'], tree, dictionary)).toEqual([
        [
          tree.next.char['a'].next.redirect['animal'].next.segment['f'],
        ]
      ])
    })

    it('returns an empty array given a fully qualified nested redirect with a remainder that is invalid on the top context', () => {
      const dictionary = new Dictionary()
      dictionary.new('insects', ['a', 'arachnid'])
      dictionary.new('critter', [['bug', {kind: 'insects'}], 'fish'])
      
      const tree = new PrefixTree()
      tree.add(['a', { animal: ['critter'] }, 'flower'])
      
      expect(tree.getMatches(['a', 'bug', 'a', 'fu'], tree, dictionary)).toEqual([])
    })
    
    it('returns an empty array on an invalid partial nested redirect', () => {
      const dictionary = new Dictionary()
      dictionary.new('insects', ['ant', 'arachnid'])
      dictionary.new('critter', [['bug', {kind: 'insects'}], 'fish'])
      
      const tree = new PrefixTree()
      tree.add(['a', { animal: ['critter'] }])
      
      expect(tree.getMatches(['a', 'bug', 'ax'], tree, dictionary)).toEqual([])
    })
  })
  
  
  describe('.suggest(...)', () => {
    it.skip('suggests a word given a char and a trie populated with one word', () => {
      const tree = new PrefixTree()
      tree.add('starfish')

      expect(tree.suggest('s')).toEqual([ ['starfish'] ])
    })

    it.skip('suggests a sequence given a char and a trie populated with a sequence', () => {
      const tree = new PrefixTree()
      tree.add(['become', 'empty', 'enter', 'the', 'void'])

      expect(tree.suggest('b')).toEqual([ ['become', 'empty', 'enter', 'the', 'void'] ])
    })

    it.skip('suggests a sequence given a partial sequence and a trie populated with a sequence', () => {
      const tree = new PrefixTree()
      tree.add(['become', 'zmpty', 'enter', 'the', 'void'])

      expect(tree.suggest(['become', 'zmpty'])).toEqual([ ['become', 'zmpty', 'enter', 'the', 'void'] ])
    })

    it.skip('suggests a sequence with a redirect', () => {
      const tree = new PrefixTree()
      tree.add(['edit', { sound: 'symbols.sounds' }])

      expect(tree.suggest('e')).toEqual([ ['edit', { value: 'sound', redirect: true, contexts: ['symbols.sounds']}]])
    })

    it.skip('suggests sequences given a pattern with a partially completed redirect', () => {
      const dictionary = new Dictionary()
      dictionary.new('symbols.sounds', ['flute', 'flugelhorn'])
      
      const tree = new PrefixTree()
      tree.add(['edit', { sound: 'symbols.sounds' }])

      expect(tree.suggest(['edit', 'f'], dictionary)).toEqual([
        ['edit', 'flute'],
        ['edit', 'flugelhorn'],
      ])
    })

    it.skip('suggests sequences given a partially completed redirect followed by a concrete match', () => {
      const dictionary = new Dictionary()
      dictionary.new('symbols.sounds', ['flute', 'flugelhorn'])
      
      const tree = new PrefixTree()
      tree.add(['edit', { sound: 'symbols.sounds' }, 'now'])

      expect(tree.suggest(['edit', 'f'], dictionary)).toEqual([
        ['edit', 'flute', 'now'],
        ['edit', 'flugelhorn', 'now'],
      ])
    })
    
    it.skip('suggests sequences given a fully completed redirect followed by a concrete match', () => {
      const dictionary = new Dictionary()
      dictionary.new('symbols.sounds', ['flute', 'flugelhorn'])
      
      const tree = new PrefixTree()
      tree.add(['edit', { sound: 'symbols.sounds' }, 'now'])

      expect(tree.suggest(['edit', 'flute'], dictionary)).toEqual([
        ['edit', 'flute', 'now'],
      ])
    })

    it.skip('suggests sequences given a fully completed redirect followed by a concrete match', () => {
      const dictionary = new Dictionary()
      dictionary.new('symbols.sounds', ['flu', 'flugelhorn'])
      
      const tree = new PrefixTree()
      tree.add(['edit', { sound: 'symbols.sounds' }, 'now'])

      expect(tree.suggest(['edit', 'flu'], dictionary)).toEqual([
        ['edit', 'flu', 'now'],
        ['edit', 'flugelhorn', 'now'],
      ])
    })

    it.skip('suggests sequences ...', () => {
      const dictionary = new Dictionary()
      dictionary.new('symbols.sounds', ['flute', ['flugelhorn', 'now'] ])
      
      const tree = new PrefixTree()
      tree.add(['edit', { sound: 'symbols.sounds' }, 'now'])

      expect(tree.suggest(['edit', 'f'], dictionary)).toEqual([
        ['edit', 'flute', 'now'],
        ['edit', 'flugelhorn', 'now', 'now'],
      ])      
    })

    it.skip('suggests sequences ... ', () => {
      const dictionary = new Dictionary()
      dictionary.new('collections', ['one', 'two'])
      dictionary.new('symbols.sounds', ['flute', ['flugelhorn', {collection: 'collections'}] ])
      
      const tree = new PrefixTree()
      tree.add(['edit', { sound: 'symbols.sounds' }, 'now'])

      expect(tree.suggest(['edit', 'f'], dictionary)).toEqual([
        ['edit', 'flute', 'now'],
        ['edit', 'flugelhorn', {value: 'collection', redirect: true, contexts: ['collections']}, 'now'],
      ])
    })

    it.skip('suggests sequences ... ', () => {
      const dictionary = new Dictionary()
      dictionary.new('collections', ['now'])
      dictionary.new('symbols.sounds', ['flute', ['flute', {collection: 'collections'}] ])
      
      const tree = new PrefixTree()
      tree.add(['edit', { sound: 'symbols.sounds' }, 'now'])

      expect(tree.suggest(['edit', 'flute', 'n'], dictionary)).toEqual([
        ['edit', 'flute', 'now'],
        ['edit', 'flute', 'now', 'now'],
      ])
    })

    it.skip('suggests nothing when given a partial, non-matching sequence', () => {
      const tree = new PrefixTree()
      tree.add(['become', 'zmpty', 'enter', 'the', 'void'])

      expect(tree.suggest(['become', 'zmz'])).toEqual([])
    })

  })

})
