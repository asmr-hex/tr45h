
export class PrefixTrieNode {
  constructor(char) {
    this.children = {}
    this.end = false
    this.char = char
  }
}

export class PrefixTree extends PrefixTrieNode {
  constructor(dictionary=[], config={}) {
    super(null)
    
    for (const word of dictionary) {
      this.add(word)
    }
  }

  add(word) {
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
