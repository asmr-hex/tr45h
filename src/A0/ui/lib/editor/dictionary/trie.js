// dictionary.add('my.context', ['help', [ 'help', 'settings' ], [ 'help', 'edit' ], [ 'edit', { sound: 'symbols.sounds' } ] ] )

// NOTE: we need to be able to distinguish between the end of a word and the end of a segment.
// e.g. ['help', 'helpme', ['help', 'me']] are three different things
// need to be able to tell if it is the end of a word or a segment peice

export class PrefixTrieNode {
  constructor(char, meta={}) {
    this.children = {}
    this.child    = { chars: {}, segments: {} }
    this.end      = false
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
    // TODO parse suggestion. could be a single word
    this._add(suggestion)
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

  _suggest(str) {
    // rework suggest method
  }
  
  // the output of suggest will either be a list of objects
  // or a list of lists of objects (i.e. on suggestion can have multiple segments)
  suggest(str) {
    const getSubTree = (string, tree) => {
      let node = tree
      while (string) {
        node = node.children[string[0]]
        if (!node) return node
        string = string.substr(1)
      }
      return node
    }

    let suggestions = []

    const getSuggestions = (string, tree) => {
      for (const k in tree.children) {
        const child = tree.children[k]
        const newString = string + child.char
        if (child.end) {
          suggestions.push(newString)
        }
        getSuggestions(newString, child)
      }
    }

    const subTree = getSubTree(str, this)
    if (subTree) getSuggestions(str, subTree)

    return suggestions.sort()
  }
}


