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
  constructor(key, meta={}) {
    this.next     = { char: {}, segment: {}, redirect: {} }
    this.end      = false
    this.key      = key
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
    const addWord = (node, str) => {
      if ( str.length === 0) return node
      if (!node.next.char[str[0]]) {
        node.next.char[str[0]] = new PrefixTrieNode(str[0])
        if (str.length === 1) node.next.char[str[0]].end = true // TODO maybe add metadata to each word.
      }

      if (str.length > 1) return addWord(node.next.char[str[0]], str.slice(1))

      return node.next.char[str[0]]
    }

    const addRedirect = (tree, segments) => {
      for (const [type, contexts] of Object.entries(segments[0])) {
        tree.next.redirect[type] = new PrefixTrieNode(type, { contexts })

        if (segments.length > 1) {
          switch (this.getInputType(segments[1])) {
          case InputTypes.Redirect:
            addRedirect(tree.next.redirect[type], segments.slice(1))
            break
          case InputTypes.Word:
            addSegments(tree.next.redirect[type], segments.slice(1))
            break
          }
        }
      }      
    }
    
    const addSegments = (tree, segments) => {
      if (segments.length === 0) return
      let node = addWord(tree, segments[0])
      if (segments.length === 1) return

      if (this.getInputType(segments[1]) === InputTypes.Redirect) {
        addRedirect(node, segments.slice(1))
        return
      }
      
      if (segments[1].length === 0) return

      const c = segments[1][0]
      if (!node.next.segment[c]) node.next.segment[c] = new PrefixTrieNode(c)
      node = node.next.segment[c]
      const newSegments = [segments[1].slice(1)].concat(segments.length > 2 ? segments.slice(2) : [])
      addSegments(node, newSegments)
    }

    // decide how to handle input
    switch (this.getInputType(suggestion)) {
    case InputTypes.Segments:
      if (suggestion.length === 1) { addWord(this, suggestion[0])  }          // treat just as a word.
      else                         { addSegments(this, suggestion) }          // more than just a word.
      break
    case InputTypes.Word:
      addWord(this, suggestion)
      break
    default:
      throw new Error('bad input to PrefixTrieNode.add(...)')  // TODO make better errors
    }
  }

  // input can be a single string (word)
  // an arrray of strings (segments)
  suggest(input) {
    let suggestions = []

    // TODO update this to handle segmented inputs
      const getSuggestions = (string, tree) => {
        for (const k in tree.next.char) {
          const child = tree.next.char[k]
          const newString = string + child.key
          if (child.end) {
            suggestions.push(newString)
          }
          getSuggestions(newString, child)
        }
      }

    const subTree = this.getMatchingSubTree(input, this)
    if (subTree) getSuggestions(input, subTree)

    return suggestions.sort()    
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
    while (segments.length > 0) {
      node = this.getSubTreeMatchingWord(segments[0], node)
      if (!node) return node
      segments = segments.slice(1) || []
    }
    return node
  }

  getSubTreeMatchingWord(word, tree) {
    let node = tree
    while (word) {
      node = node.next.char[word[0]]
      if (!node) return node
      word = word.substr(1)
    }
    return node
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
  //     for (const w in tree.next.char) {
  //       const child = tree.next.char[w]
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


