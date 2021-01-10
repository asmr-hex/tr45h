import { filter, range, reduce } from 'lodash'
import {
  EditorState,
  Modifier,
  SelectionState,
  convertToRaw,
} from 'draft-js'


// TODO build AutoSuggest into Decorator....?
// TODO make different prefixTrees for different dictionary types
// TODO candidates map to a list of dictionary types to search over.
export class AutoSuggest {
  constructor(decorator, dictionary=[], candidates=[]) {
    this.decorator = decorator
    this.prefixTree = new PrefixTree(dictionary)
  }

  analyze(editorState) {
    const newEditorState = this.removeOldSuggestion(editorState)
    
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

  removeOldSuggestion(editorState) {    
    // remove old text
    const selection    = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const block        = contentState.getBlockForKey(selection.getAnchorKey())

    // get any entity ranges....... MUST BE A BETTER WAY....
    const { start, end } = reduce(
      range(0, block.getLength()),
      (acc, i) => {
        const entity = block.getEntityAt(i)
        if ( entity === null ) return acc

        if (acc.start === null) return {start: i, end: i+1}

        return {...acc, end: i+1}
      },
      {start: null, end: null}
    )

    if (start === null || end === null) return editorState
    console.log(`${start} - ${end}`)
    
    const insertSelection = SelectionState
          .createEmpty(selection.getAnchorKey())
          .merge({anchorOffset: start, focusOffset: end})

    const contentStateWithoutSuggestion = Modifier.replaceText(
      contentState,
      insertSelection,
      '',
      null,
      null,
    )

    console.log(`POST REMOVLA TEXT: ${contentStateWithoutSuggestion.getPlainText()}`)
    
    const editorStateWithoutSuggestion = EditorState.set(
      editorState,
      { currentContent: contentStateWithoutSuggestion },
    )

    return EditorState.forceSelection(editorStateWithoutSuggestion, selection)
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
    const contentStateWithSuggestionEntity = contentState.createEntity('INLINE-SUGGESTION', 'IMMUTABLE')
    const contentStateWithSuggestion = Modifier.insertText(
      contentStateWithSuggestionEntity,
      insertSelection,
      remainder,
      null,
      contentStateWithSuggestionEntity.getLastCreatedEntityKey(),
    )

    console.log("(setting editor state)")
    const editorStateWithSuggestion = EditorState.set(
      editorState,
      { currentContent: contentStateWithSuggestion },
    )
    
    // TODO update decorator highlighting!
    console.log(token.value)
    console.log(remainder)

    return EditorState.forceSelection(editorStateWithSuggestion, selection)
  }
  
  withinToken(offset) {
    const tokens = filter(
      this.decorator.highlighted,
      v => (offset >= v.start && offset <= (v.start + v.length) && v.type !== 'SUGGESTION')
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
