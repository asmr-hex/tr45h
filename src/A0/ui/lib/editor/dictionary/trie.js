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
            const nextSegment = new PrefixTrieNode(segments[1][0])
            tree.next.redirect[type].next.segment[segments[1][0]] = nextSegment
            addSegments(nextSegment, [segments[1].substr(1)].concat(segments.length > 2 ? segments.slice(2) : []))
            break
          }
        } else {
          tree.next.redirect[type].end = true
        }
      }      
    }
    
    const addSegments = (tree, segments) => {
      if (segments.length === 0) return
      let node = null
      switch (this.getInputType(segments[0])) {
      case InputTypes.Word:
        node = addWord(tree, segments[0], segments.length === 1)
        break
      case InputTypes.Redirect:
        addRedirect(tree, segments)
        return
      }
      
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
      addSegments(this, suggestion)
      // if (suggestion.length === 1) { addWord(this, suggestion[0])  }          // treat just as a word.
      // else                         { addSegments(this, suggestion) }          // more than just a word.
      break
    case InputTypes.Word:
      addWord(this, suggestion)
      break
    default:
      throw new Error('bad input to PrefixTrieNode.add(...)')  // TODO make better errors
    }
  }

  isLeaf(node) {
    return keys(node.next.char).length     === 0 &&
           keys(node.next.segment).length  === 0 &&
           keys(node.next.redirect).length === 0      
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

    const complete = (matches, pattern) => {
      const match       = matches[matches.length-1]
      const isLastMatch = matches.length === 1

      if (match.end || this.isLeaf(match)) {
        if (matches.length !== 1) complete(matches.slice(0, -1), pattern)
      }
      
      for (const i in match.next.char) {  // getting a word
        const c = match.next.char[i]
        const newPattern = [...pattern.slice(0, -1), pattern[pattern.length-1] + c.key]
        const newMatches = this.isLeaf(c) ? matches.slice(0, -1) : [...matches.slice(0, -1), c]

        if (c.end && isLastMatch) suggestions.push(newPattern)
        
        if (newMatches.length !== 0) complete(newMatches, newPattern)

      }
      for (const i in match.next.segment) {  // getting a segment
        const s = match.next.segment[i]
        const newPattern = [...pattern, i]
        const newMatches = [...matches.slice(0, -1), s]
        complete(newMatches, newPattern)
      }
      for (const i in match.next.redirect) {
        const r = match.next.redirect[i]
        const newPattern = [...pattern, {value: i, redirect: true, contexts: r.meta.contexts}]
        const newMatches = this.isLeaf(r) ? matches.slice(0, -1) : [...matches.slice(0, -1), r]
        
        if (r.end && isLastMatch) suggestions.push(newPattern)
        
        if (newMatches.length !== 0) complete(newMatches, newPattern)
      }
    }

    const matches = this.getMatches(input, this, dictionary)
    for (const match of matches) {
      complete(match, input)
    }

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

  getMatches(input, tree, dictionary, nested=false) {
    let   node        = tree
    let   subtrees    = [] // Array<{ subtree: Array<tree>, remainder: Array<words>}> where the inner Array is the sequence of nested scopes.
    const isLastInput = input.length === 1

    const newNode = this.getMatchingWord(input[0], node)
    if (newNode) {
      if (isLastInput) {
        // if newNode is end, we append an empty subtree? but what about if we are nested?
        // if !nested:
        //   if newNode.end || !newNode.end -> return the [newNode]
        // if nested:
        //   if newNode.end -> return []
        //   else           -> return [newNode]
        if (nested && newNode.end) {
          subtrees.push({ subtree: [newNode], remainder: [] }) // TODO this used to be subTree: [], but this logic might be wrong. in fact, we might not need all these cases at all.
        } else {
          subtrees.push({ subtree: [newNode], remainder: [] })
        }
      } else {
        if (newNode.end && nested) {
          subtrees.push({ subtree: [], remainder: input.slice(1) })
        }
        if (input[1][0] in newNode.next.segment) {
          subtrees = subtrees.concat(this.getMatches(input.slice(1), newNode.next.segment[input[1][0]], dictionary, nested))
        }
        
        // get redirection subtrees
        for (const [ name, redirect ] of Object.entries(newNode.next.redirect)) {
          subtrees = subtrees.concat(this.getMatchingRedirect(input.slice(1), redirect, dictionary, nested))
        }          
      }
    }

    if (!nested && isLastInput) subtrees = subtrees.map(s => s.subtree)
    
    // get redirection subtrees // right now, this is never hit because the ADD method doesn't allow
    // redirects as the first node. must change this.
    for (const [ name, redirect ] of Object.entries(node.next.redirect)) {
      subtrees = subtrees.concat(this.getMatchingRedirect(input, redirect, dictionary, nested))
    }
    
    return subtrees    
  }

  // need to distinguish between when a subcontext:
  // (1) has found fully qualified stuff and exhausted the input         (this case means there is definitely a match, just return this redirect node as a subtree to generate suggestions)
  // (2) has found partially qualified stuff and has exhausted the input (this case means there is definitely a match, return the node from the sub context in an array with the redirect node prepending it-- so when generating suggestions, we first generate all suggestions for subcontext tree, then append all suggestions for the context higher up (before it in the array))
  // (3) has found fully qualified stuff and not exhausted the input     (this case means there is still a possible match, must getSubtrees of this redirect node (in this context))
  // (4) has found partially qualified stuff and not exausted the input  (this case means there is no possible match)
  // get subtrees in nested contexts
  getMatchingRedirect(input, redirect, dictionary, nested=false) {
    let subtrees       = []
    let appendRedirect = false

    
    
    for (const context of redirect.meta.contexts) {
      for (const result of this.getMatches(input, dictionary.get(context), dictionary, true)) {
        // analyze result above, which case does we fall into for this?
        // (1) if subsubtree.node is []    AND subsubtree.remainder is []
        // (2) if subsubtree.node is [...] AND subsubtree.remainder is []
        // (3) if subsubtree.node is []    AND subsubtree.remainder is [...]
        // (4) if subsubtree isn't even included in results.
        
        // (1) concat redirect node as subtree to generate autosuggestions
        if (result.subtree.length === 0 && result.remainder.length === 0)
          appendRedirect = true

        // (2) concat [redirect, ...result.subtree] to subtree to generate autosuggetions
        if (result.subtree.length !== 0 && result.remainder.length === 0) {
          const subtree = this.isLeaf(redirect) ? result.subtree : [redirect, ...result.subtree]
          if (nested) {
            subtrees.push({ subtree, remainder: [] })   
          } else {
            subtrees.push(subtree)
          }
        }

        // (3) concat result of getRemainders(result.remainder, redirect, dictionary, nested) to generate autosuggestions
        if (result.subtree.length === 0 && result.remainder.length !== 0) {
          if (result.remainder[0][0] in redirect.next.segment) {
            subtrees = subtrees.concat(this.getMatches(result.remainder, redirect.next.segment[result.remainder[0][0]], dictionary, nested))
          } else {
            // if the remainder isn't in this context, we need to allow it to bubble up to the next one.
            subtrees.push(result)
          }
          subtrees = subtrees.concat(this.getMatches(result.remainder, redirect, dictionary, nested))
        }
          
      }
    }

    if (appendRedirect) subtrees.push({ subtree: [redirect], remainder: [] })

    return subtrees
  }
  
  getMatchingWord(word, tree) {
    let node = tree
    // handle the case that this is not the starting node of a tree.
    if (node.key !== null) {
      // this must be the root of a Segment PrefixTree
      // create a fake root node.
      node = { next: { char: { [node.key]: node } } }
    }
    while (word) {
      node = node.next.char[word[0]]
      if (!node) return null
      word = word.substr(1)
    }
    return node
  }
}
