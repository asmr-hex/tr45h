import { keys } from 'lodash'

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
    const addWord = (node, str, ends=true) => {
      if ( str.length === 0) return node
      if (!node.next.char[str[0]]) {
        node.next.char[str[0]] = new PrefixTrieNode(str[0])
        if (str.length === 1) node.next.char[str[0]].end = ends // TODO maybe add metadata to each word.
      }

      if (str.length > 1) return addWord(node.next.char[str[0]], str.slice(1), ends)

      return node.next.char[str[0]]
    }

    const addRedirect = (tree, segments) => {
      for (const [type, contexts] of Object.entries(segments[0])) {
        // normalize contexts to an array
        const ctx = Array.isArray(contexts) ? contexts : [ contexts ]
        tree.next.redirect[type] = new PrefixTrieNode(type, { contexts: ctx })

        if (segments.length > 1) {
          switch (this.getInputType(segments[1])) {
          case InputTypes.Redirect:
            addRedirect(tree.next.redirect[type], segments.slice(1))
            break
          case InputTypes.Word:
            addSegments(tree.next.redirect[type], segments.slice(1))
            break
          }
        } else {
          tree.next.redirect[type].end = true
        }
      }      
    }
    
    const addSegments = (tree, segments) => {
      if (segments.length === 0) return
      let node = addWord(tree, segments[0], segments.length === 1)
      if (segments.length === 1) return

      if (this.getInputType(segments[1]) === InputTypes.Redirect) {
        addRedirect(node, segments.slice(1))
        return
      }
      
      if (segments[1].length === 0) return

      const c = segments[1][0]
      if (!node.next.segment[c]) node.next.segment[c] = new PrefixTrieNode(c)
      node = node.next.segment[c]
      if (segments[1].length === 1 && segments.length === 2) {
        node.end = true
        return
      }
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
  //
  // output will be an array of arrays
  // each inner array will be a segment sequence
  // each item in the inner array will be an object with the value and some metadata
  // [ [ {...}, {...}], [{...}] ]
  suggest(input, dictionary=null) {
    // normalize input to always be an array
    if (this.getInputType(input) === InputTypes.Word) input = [ input ]
    
    let suggestions = []

    // TODO update this to handle segmented inputs
    const getSuggestions = (pattern, tree) => {
      for (const i in tree.next.char) {  // getting a word
        const c = tree.next.char[i]
        const newPattern = [...pattern.slice(0, -1), pattern[pattern.length-1] + c.key]
        if (c.end) suggestions.push(newPattern)
        getSuggestions(newPattern, c)
      }
      for (const i in tree.next.segment) {  // getting a segment
        const s = tree.next.segment[i]
        getSuggestions([...pattern, i], s)
      }
      for (const r in tree.next.redirect) {
        const newPattern = [...pattern, {value: r, redirect: true, contexts: tree.next.redirect[r].meta.contexts}]
        if (tree.next.redirect[r].end) suggestions.push(newPattern)
        getSuggestions(newPattern, tree.next.redirect[r])
      }
    }

    // TODO there may be multiple subtrees (due to redirects)
    const subTree = this.getMatchingSubTree(input, this, dictionary) // TODO IF NEXT SUBTREE IS A REDIRECT... how will this work?
    if (subTree) getSuggestions(input, subTree)

    return suggestions.sort()    
  }

  // works just like suggest, but instead of returning no results, it returns the best
  // suggestions and their tailing remainders (the input that doesnt quite match)
  // to it returns an array like,
  // [
  //   { suggestion: [...], remainder: [...]}
  //   ...
  // ]
  getBestSuggestion(input, dictionary) {
    let suggestions = []

    const getSuggestions = (pattern, tree) => {
      
    }


    
    return suggestions
  }

  // TODO
  remove(word) {}

  getInputType(pattern) {
    if ( Array.isArray(pattern) )                                   return InputTypes.Segments
    if ( typeof pattern === 'string' || pattern instanceof String ) return InputTypes.Word
    if ( typeof pattern === 'object' && pattern !== null )          return InputTypes.Redirect

    return null
  }

  getSubTreeMatchingSegments(segments, tree, dictionary) {
    let node = tree
    while (segments.length > 0) {
      node = this.getSubTreeMatchingWord(segments[0], node)
      if (!node)                 return node
      if (segments.length === 1) return node

      // if the current node is a redirect....
      if (keys(node.next.redirect).length !== 0) {
        // search other prefix trees! JUST PARSE HERE AND NOW and somehow add thes results (annotated) to the return results
        // this way we can recursively parse suggestions!
        for (const [type, segment] of Object.entries(node.next.redirect)) {
          console.log(dictionary.suggest(segments[1], segment.meta.contexts))
        }
        
      }
      
      
      const firstChar = segments[1][0]
      if (!firstChar) return null

      segments = [segments[1].substr(1)].concat(segments.length > 2 ? segments.slice(2) : [])
      node     = node.next.segment[firstChar]

      if (!node) return null
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
  
  getMatchingSubTree(pattern, tree, dictionary=null) {
    switch (this.getInputType(pattern)) {
    case InputTypes.Segments:
      if (pattern.length === 1) return this.getSubTreeMatchingWord(pattern[0], tree)               // treat just as a word.
      else                      return this.getSubTreeMatchingSegments(pattern, tree, dictionary)  // more than just a word.
    case InputTypes.Word:
      return this.getSubTreeMatchingWord(pattern, tree)
    default:
      throw new Error('pattern is invalid type') // TODO update with more formalized error message
    }
  }
}


