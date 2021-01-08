import { filter } from 'lodash'
import {
  EditorState,
  Modifier,
  SelectionState,
} from 'draft-js'


// TODO build AutoSuggest into Decorator....?
// TODO make different prefixTrees for different dictionary types
// TODO candidates map to a list of dictionary types to search over.
export class AutoSuggest {
  constructor(decorator, dictionary=[], candidates=[]) {
    this.decorator = decorator
    this.prefixTree = new PrefixTree(dictionary)
  }

  analyze(newEditorState) {
    const selection = newEditorState.getSelection()

    // make sure selection is collapsed
    if (!selection.isCollapsed()) return newEditorState

    // get selection offset
    const offset = selection.getAnchorOffset()

    // is offset within a token?
    const token = this.withinToken(offset)
    if (token === null) return newEditorState

    // TODO is the token a suggestion candidate?

    // what are the top suggestion matches for this token?
    const suggestions = this.getSuggestions(token)

    // take the first suggestion
    const newEditorStateWithSuggestion = this.inlineSuggestion(token, suggestions, newEditorState)
    
    return newEditorStateWithSuggestion
  }

  inlineSuggestion(token, suggestions, editorState) {
    if (suggestions.length === 0) return editorState
    const suggestion = suggestions[0]

    // get non-overlapping suffix of suggestion
    const remainder = suggestion.substr(token.value.length)
    const endOfTokenOffset = token.start + token.length

    const selection    = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const insertSelection = SelectionState
          .createEmpty(selection.getAnchorKey())
          .merge({anchorOffset: endOfTokenOffset, focusOffset: endOfTokenOffset})

    // place remainder text after token
    const contentStateWithSuggestion = Modifier.insertText(
      contentState,
      insertSelection,
      remainder,
    )
    const editorStateWithSuggestion = EditorState.push(
      editorState,
      contentStateWithSuggestion,
    )
    
    // TODO update decorator highlighting!
    console.log(remainder)

    return EditorState.forceSelection(editorStateWithSuggestion, selection)
  }
  
  withinToken(offset) {
    const tokens = filter(
      this.decorator.highlighted,
      v => (offset >= v.start && offset <= (v.start + v.length))
    )

    return tokens.length === 0 ? null : tokens[0]
  }

  getSuggestions(token) {
    return this.prefixTree.suggest(token.value)
  }
}

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
