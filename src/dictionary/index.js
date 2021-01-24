import { PrefixTree } from './trie'


/**
 * stores and categorizes important words/phrases to be used for auto-suggestion.
 *
 * @description one dictionary can be used for the entire application. prefix-trees can
 * be stored by groups.
 */
export class Dictionary {
  constructor() {
    this.groups = {}
  }

  new(groupPath) {}
  
  add(groupPath, words) {}

  remove(groupPath, words) {}
  
}
