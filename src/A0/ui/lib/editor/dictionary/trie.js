// dictionary.add('my.context', ['help', [ 'help', 'settings' ], [ 'help', 'edit' ], [ 'edit', { sound: 'symbols.sounds' } ] ] )

// NOTE: we need to be able to distinguish between the end of a word and the end of a segment.
// e.g. ['help', 'helpme', ['help', 'me']] are three different things
// need to be able to tell if it is the end of a word or a segment peice

const InputTypes = {
  Segments: 'SEGMENTS',
  Word:     'WORD',
  Redirect: 'REDIRECT',
}

export class PrefixTrieNode {
  constructor(char, meta={}) {
    this.child    = { words: {},    segments: {} }
    this.end      = { word:  false, segment:  false }
    this.char     = char
    this.meta     = meta
  }
}

export class PrefixTree extends PrefixTrieNode {
  constructor(suggestions=[]) {
    super(null)
    
    for (const suggestion of suggestions) {
      this.add(suggestion)
    }
  }

  add(suggestion) {
    const addWord = (node, pattern) => {
      if (!node.child.words[pattern[0]]) {
        node.child.words[pattern[0]] = new PrefixTrieNode(pattern[0])
        if (pattern.length === 1) {
          node.child.words[pattern[0]].end.word = true
        }
      }

      if (pattern.length > 1) {
        return addWord(node.child.words[pattern[0]], pattern.slice(1))
      }

      return node.child.words[pattern[0]]
    }

    const addSegments = (tree, segments) => {
      if (segments.length === 0) return
      let node = tree
      node = addWord(node, segments[0])
      if (segments.length === 1) return
      if (!node.child.segments[segments[1][0]]) {
        node.child.segments[segments[1][0]] = new PrefixTrieNode(segments[1][0])
      }
      node = node.child.segments[segments[1][0]]
      const newSegments = [segments[1].slice(1)].concat(segments.length > 2 ? segments.slice(2) : [])
      addSegments(node, newSegments)
    }

    switch (this.getInputType(suggestion)) {
    case InputTypes.Segments:
      addSegments(this, suggestion)
      break
    case InputTypes.Word:
      addWord(this, suggestion)
      break
    }
  }
  
  _add(word) {
    const addFn = (node, str) => {
      if (!node.children[str[0]]) {
        node.children[str[0]] = new PrefixTrieNode(str[0])
        if (str.length === 1) {
          node.children[str[0]].end = true
        }
      }

      if (str.length > 1) {
        addFn(node.children[str[0]], str.slice(1))
      }
    }
    
    addFn(this, word)
  }

  // TODO
  remove(word) {}

  getInputType(pattern) {
    if ( Array.isArray(pattern) )                                   return InputTypes.Segments
    if ( typeof pattern === 'string' || pattern instanceof String ) return InputTypes.Word
    if ( typeof pattern === 'object' && pattern !== null )          return InputTypes.Redirect

    return null
  }

  getSubTreeMatchingSegments(segments, tree) {
    let node = tree
  }

  getSubTreeMatchingWord(word, tree) {
    let node = tree
  }
  
  getMatchingSubTree(pattern, tree) {
    switch (this.getInputType(pattern)) {
    case InputTypes.Segments:
      return this.getSubTreeMatchingSegments(pattern, tree)
    case InputTypes.Word:
      return this.getSubTreeMatchingWord(pattern, tree)
    default:
      throw new Error('pattern is invalid type') // TODO update with more formalized error message
    }
  }
  
  // suggest should accept either a single word, or a array of tokens
  // if an array of tokens, the subtree we get should match all segments
  // leading up to the final segment we gave.
  // _suggest(input) {
  //   let suggestions = []

  //   const getSuggestions = (pattern, tree) => {
  //     for (const w in tree.child.words) {
  //       const child = tree.child.words[w]
  //       let patternType = this.getInputType(pattern)
  //       let newPattern
  //       switch (this.getInputType(pattern)) {
  //       case InputTypes.Word:
  //         newPattern = pattern + child.char
  //         if (child.end.word) {
  //           suggestions.push(newPattern)
  //         }
  //         break
  //       case InputTypes.Segments:
  //         newPattern = [...pattern.slice(0, pattern.length-1), pattern[pattern.length-1] + child.char]
  //         if (child.end.segment) {
  //           newPattern.push('')
  //           suggestions.push(newPattern)
  //         }
  //         break
  //       default:
  //         throw new Error('invalid pattern type') // TODO update with better error
  //       }
  //     }
  //     for (const s in tree.child.segments) {
  //       const child = tree.child.segments[s]
        
  //     }
  //   }

  //   const subTree = this.getMatchingSubTree(input, this)
  //   if (subTree) getSuggestions(input, subTree)

  //   return suggestions // TODO sort somehow
  // }
  
  // the output of suggest will either be a list of objects
  // or a list of lists of objects (i.e. on suggestion can have multiple segments)
  // suggest(str) {
  //   const getSubTree = (string, tree) => {
  //     let node = tree
  //     while (string) {
  //       node = node.children[string[0]]
  //       if (!node) return node
  //       string = string.substr(1)
  //     }
  //     return node
  //   }

  //   let suggestions = []

  //   const getSuggestions = (string, tree) => {
  //     for (const k in tree.children) {
  //       const child = tree.children[k]
  //       const newString = string + child.char
  //       if (child.end) {
  //         suggestions.push(newString)
  //       }
  //       getSuggestions(newString, child)
  //     }
  //   }

  //   const subTree = getSubTree(str, this)
  //   if (subTree) getSuggestions(str, subTree)

  //   return suggestions.sort()
  // }
}


