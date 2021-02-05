import { get, set } from 'lodash'

import { PrefixTree } from './trie'


/**
 * stores and categorizes important words/phrases to be used for auto-suggestion.
 *
 * @description one dictionary can be used for the entire application. prefix-trees can
 * be stored by context.
 */
export class Dictionary {
  constructor() {
    this.contexts = {}
  }

  new(context, words=[]) {
    set(this.contexts, context, new PrefixTree(words))
  }
  
  add(context, words) {
    const trie = get(this.contexts, context)
    for (const word of words) {
      trie.add(word)
    }
  }

  remove(context, words) {
    const trie = get(this.contexts, context)
    for (const word of words) {
      trie.remove(word)
    }    
  }

  suggest(str, contexts) {
    let suggestions = []
    for (const context of contexts) {
      suggestions = [...suggestions, ...get(this.contexts, context).suggest(str)]
    }

    return suggestions
  }

  // given a sequence of tokens, this finds the first matching complete word/phrases
  // in the provded contexts. the remaining segments in the sequence are returned also
  findMatchingSubTrees(segments, contexts) {
    for (const context of contexts) {
      // TODO
    }
  }
}



