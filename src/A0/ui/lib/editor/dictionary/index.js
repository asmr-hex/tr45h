import { get, set } from 'lodash'

import { PrefixTree } from './trie'


/**
 * stores and categorizes important words/phrases to be used for auto-suggestion.
 *
 * @description one dictionary can be used for the entire application. prefix-trees can
 * be stored by context.
 */
export class Dictionary {
  constructor(sort=false) {
    this.contexts = {}
    this.sort     = sort  // TODO if this is enabled, sort suggestions based on order in which contextst were added.
    // this way, the configuration for search order is explicit according to how dictionary is initialized with
    // only one additional config parameter.
  }

  new(context, words=[], sort=false) { // TODO add sort conf paramter to PRefixTreee in a similar way to above.
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

  get(context) {
    return get(this.contexts, context)
  }
}



