import { filter, map, range, reduce, values } from 'lodash'
import {
  EditorState,
  Modifier,
  SelectionState,
  convertToRaw,
} from 'draft-js'


const suggestionEntityPrefix = 'INLINE-SUGGESTION-'
const makeEntityType = type => `${suggestionEntityPrefix}${type}`
export const isSuggestionEntity = type => type && (typeof type === 'string') && type.startsWith(suggestionEntityPrefix)
export const getSuggestionEntityType = type => type.substr(suggestionEntityPrefix.length)

// TODO refactor this....to be more understandable...

export class AutoSuggest {
  constructor({ tokens, dictionary, suggestions }) {
    this.tokens             = tokens
    this.setSuggestions     = suggestions.set
    this.inline             = suggestions.inline
    this.defaultSuggestions = suggestions.default
    this.matchLine          = suggestions.matchLine
    this.dictionary         = dictionary

    this.showDefaults = suggestions.default.length === 0 ? false : true
    
    this.anchorToken = null
    
    this.suggestions = {
      current: null,
      candidates: [],
    }
  }

  analyze(editorState) {
    console.log(`---------------------`)
    console.log(`PRE: ${editorState.getCurrentContent().getPlainText()}`)
    
    const newEditorState = this.removeSuggestion(editorState)
    
    const selection = newEditorState.getSelection()
    
    // make sure selection is collapsed
    if (!selection.isCollapsed()) {
      this.updateSuggestions(null, [])
      return newEditorState 
    }

    console.log(`POS: ${newEditorState.getCurrentContent().getPlainText()}`)
    
    // get selection offset
    const key    = selection.getAnchorKey()
    const offset = selection.getAnchorOffset()

    if (this.matchLine) return this.analyzeLine(key, newEditorState)
    
    // is offset within a token?
    const token = this.getBoundingToken(key, offset)
    if (token === null) {
      this.updateSuggestions(null, [])
      return newEditorState 
    }

    // make sure token is a suggestion trigger.
    if (!('suggest' in token)) {  // TODO formalize this notion of a suggestion trigger token.
      this.updateSuggestions(null, [])
      return newEditorState       
    }
    
    // TODO is the token a suggestion candidate? LOOK FOR SUGGESTION TRIGGERS
    let contexts
    if ('contexts' in token.suggest) {
      contexts = token.suggest.contexts
    }
    
    // what are the top suggestion matches for this token?
    const suggestions = this.getSuggestions(contexts, [token])

    if (suggestions.length === 0) {
      this.updateSuggestions(null, [])
      return newEditorState 
    }
    
    // take the first suggestion
    const newEditorStateWithSuggestion = this.insertSuggestion(token, suggestions[0], newEditorState)

    // update suggestion list
    this.updateSuggestions(suggestions[0], suggestions.slice(1))
    
    return newEditorStateWithSuggestion
  }

  analyzeLine(key, editorState) {
    // search all default contexts for word match
    const suggestions = this.getSuggestions(this.defaultSuggestions, this.areTokensEmpty(key) ? [this.getDefaultSuggestionToken()] : values(this.tokens[key]))

    if (suggestions.length === 0) {
      this.updateSuggestions(null, [])
      return editorState 
    }

    const { token, suggestion } = this.getLastTokenAndSuggestion(this.areTokensEmpty(key) ? [this.getDefaultSuggestionToken()] : values(this.tokens[key]), suggestions[0])
    
    // take the first suggestion
    const newEditorStateWithSuggestion = this.insertSuggestion(token, suggestion, editorState)

    // update suggestion list
    this.updateSuggestions(suggestions[0], suggestions.slice(1))

    return newEditorStateWithSuggestion
  }
  
  updateSuggestions(current, candidates) {
    this.suggestions = {
      current,
      candidates,
    }
    this.setSuggestions(candidates.length === 0 ? [] : candidates)
  }

  cycle(editorState) {
    if (this.suggestions.current === null) return editorState

    // update suggestions
    const nextSuggestion = this.suggestions.candidates.shift()
    if (!nextSuggestion) return editorState
    this.suggestions.candidates.push(this.suggestions.current)
    this.suggestions.current = nextSuggestion

    const newEditorState = this.removeSuggestion(editorState)

    const selection = newEditorState.getSelection()

    // make sure selection is collapsed
    if (!selection.isCollapsed()) {
      this.updateSuggestions(null, [])
      return newEditorState 
    }

    // get selection offset
    const key    = selection.getAnchorKey()
    const offset = selection.getAnchorOffset()

    if (this.matchLine) return this.cycleForEntireLine(key, newEditorState)

    // is offset within a token?
    const token = this.getBoundingToken(key, offset)
    if (token === null) {
      this.updateSuggestions(null, [])
      return newEditorState 
    }
    
    const newEditorStateWithSuggestion = this.insertSuggestion(token, this.suggestions.current, newEditorState)
    
    this.setSuggestions([...this.suggestions.candidates])

    return newEditorStateWithSuggestion
  }

  cycleForEntireLine(key, editorState) {
    // TODO some error checking?

    const { token, suggestion } = this.getLastTokenAndSuggestion(this.areTokensEmpty(key) ? [this.getDefaultSuggestionToken()] : values(this.tokens[key]), this.suggestions.current)
    
    const newEditorStateWithSuggestion = this.insertSuggestion(token, suggestion, editorState)

    this.setSuggestions([...this.suggestions.candidates])

    return newEditorStateWithSuggestion
  }
  
  complete(editorState) {
    if (this.suggestions.current === null) return editorState

    const newEditorState = this.removeSuggestion(editorState)

    const selection = newEditorState.getSelection()

    // make sure selection is collapsed
    if (!selection.isCollapsed()) {
      this.updateSuggestions(null, [])
      return newEditorState 
    }
    
    // get selection offset
    const key    = selection.getAnchorKey()
    const offset = selection.getAnchorOffset()

    if (this.matchLine) return this.completeForEntireLine(key, newEditorState)

    // is offset within a token?
    const token = this.getBoundingToken(key, offset)
    if (token === null) {
      this.updateSuggestions(null, [])
      return newEditorState 
    }

    const newEditorStateWithCompletion = this.insertAutoCompletion(token, this.suggestions.current, newEditorState)

    return newEditorStateWithCompletion
  }

  completeForEntireLine(key, editorState) {
    const { token, suggestion } = this.getLastTokenAndSuggestion(this.areTokensEmpty(key) ? [this.getDefaultSuggestionToken()] : values(this.tokens[key]), this.suggestions.current)

    const newEditorStateWithCompletion = this.insertAutoCompletion(token, suggestion, editorState)

    return newEditorStateWithCompletion
  }
  
  // this is called when we actually tab complete to complete the suggestion
  insertAutoCompletion(token, suggestion, editorState) {
    // get non-overlapping suffix of suggestion
    const remainder = [
      suggestion[0].substr(token.value.length),
      ...map(
        suggestion.slice(1),
        w => {
          if (typeof w === 'object') return `<${w.value}>`  // convert redirect tokens to plain ol' strings
          return w
        }
      )
    ].join(' ') // TODO HOLD UP, we want to limit the autocomplete to the first redirect token
    const endOfTokenOffset = token.start + token.length

    const selection    = editorState.getSelection()
    const contentState = editorState.getCurrentContent()
    const insertSelection = SelectionState
          .createEmpty(selection.getAnchorKey())
          .merge({anchorOffset: endOfTokenOffset, focusOffset: endOfTokenOffset})
    const endSelection = SelectionState
          .createEmpty(selection.getAnchorKey())
          .merge({anchorOffset: endOfTokenOffset + remainder.length, focusOffset: endOfTokenOffset + remainder.length})
    
    // place remainder text after token
    const contentStateWithSuggestion = Modifier.insertText(
      contentState,
      insertSelection,
      remainder,
      null,
      null
    )

    this.updateSuggestions(null, [])
    
    const editorStateWithSuggestion = EditorState.set(
      editorState,
      { currentContent: contentStateWithSuggestion },
    )

    return EditorState.forceSelection(editorStateWithSuggestion, endSelection)    
  }
  
  removeSuggestion(editorState) {
    // remove old text
    let   contentState = editorState.getCurrentContent()
    const selection    = editorState.getSelection()
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

    const insertSelection = SelectionState
          .createEmpty(selection.getAnchorKey())
          .merge({anchorOffset: start, focusOffset: end})

    // remove entity from selection
    contentState = Modifier.applyEntity(
      contentState,
      insertSelection,
      null,
    )

    console.log(`MID: ${contentState.getPlainText()}`)
    console.log(`     ${reduce(range(0, block.getLength()), (acc, i) => i >= start && i < end ? `${acc}-` : `${acc} `, '')}`)
    
    // remove text
    contentState = Modifier.replaceText(
      contentState,
      insertSelection,
      '',
      null,
      null,
    )
    
    const editorStateWithoutSuggestion = EditorState.set(
      editorState,
      { currentContent: contentState },
    )

    return EditorState.forceSelection(editorStateWithoutSuggestion, selection)
  }

  // this is kinda a shim for the time being.
  // it is called when the suggestion input is an array of tokens and we want to get the final token
  // and the suggestion token it coresponds to
  getLastTokenAndSuggestion(tokens, suggestion) {    
    // get the final token and its index
    const idx = tokens.length - 1
    const token = tokens[idx]

    // get the slice of the suggestions at the final token
    const subsuggestion = suggestion.slice(idx)

    return { token, suggestion: subsuggestion }
  }

  // DEPRECATE. this is not used.
  _insertSuggestion(token, suggestion, editorState) {
    // if (suggestions.length === 0) return editorState
    // const suggestion = suggestions[0]
    
    // get non-overlapping suffix of suggestion
    const remainder = [
      suggestion[0].substr(token.value.length),
      ...map(
        suggestion.slice(1),
        w => {
          if (typeof w === 'object') return `<${w.value}>`  // convert redirect tokens to plain ol' strings
          return w
        }
      )
    ].join(' ')
    const endOfTokenOffset = token.start + token.length

    // TODO. iterate over remainder tokens, create distinct entities for each (with types)
    
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

    const editorStateWithSuggestion = EditorState.set(
      editorState,
      { currentContent: contentStateWithSuggestion },
    )

    return EditorState.forceSelection(editorStateWithSuggestion, selection)
  }

  insertSuggestion(token, suggestion, editorState) {
    // get non-overlapping suggestion tokens
    const remainders = [suggestion[0].substr(token.value.length), ...suggestion.slice(1)]

    const selection  = editorState.getSelection()
    const blockKey   = selection.getAnchorKey()
    let contentState = editorState.getCurrentContent()
    let insertOffset = token.start + token.length
    
    // iterate over suggestions tokens and insert them into the text
    for (const remainder of remainders) {
      // get new selection for insertion
      const insertSelection = SelectionState
            .createEmpty(blockKey)
            .merge({anchorOffset: insertOffset, focusOffset: insertOffset})

      // get remainder suggestion text and type
      let remainderText = remainder
      let remainderType = 'default'
      if (typeof remainder === 'object') {
        remainderText = `<${remainder.value}>`
        remainderType = remainder.value
      }
      remainderText = `${remainderText} `

      // insert remainder suggestion text
      contentState = contentState.createEntity(makeEntityType(remainderType), 'IMMUTABLE')
      contentState = Modifier.insertText(
        contentState,
        insertSelection,
        remainderText,
        null,
        contentState.getLastCreatedEntityKey(),
      )

      // update insertOffset
      insertOffset += remainderText.length
    }

    const newEditorState = EditorState.set(
      editorState,
      { currentContent: contentState },
    )

    return EditorState.forceSelection(newEditorState, selection)
  }
  
  getBoundingToken(key, offset) {
    // handle default suggestions (on empty)
    if (this.defaultSuggestions.length !== 0 && (this.tokens[key] === undefined || this.tokens[key].length === 0)) {
      this.anchorToken = this.getDefaultSuggestionToken()
      return this.anchorToken
    }
    
    const tokens = filter(
      this.tokens[key],
      v => (offset >= v.start && offset <= (v.start + v.length) && !isSuggestionEntity(v.type))
    )
    this.anchorToken = tokens.length === 0 ? null : tokens[0]
    return this.anchorToken
  }

  areTokensEmpty(key) {
    return (this.tokens[key] === undefined || filter(this.tokens[key], t => !isSuggestionEntity(t.type)).length === 0)
  }
  
  getSuggestions(contexts, tokens) {
    return this.dictionary.suggest(tokens.map(t => t.value), contexts)
  }

  getDefaultSuggestionToken() {
    return {  // TODO formalize this
      value:  '',
      start:  0,
      length: 0,
      suggest: {
        contexts: this.defaultSuggestions,
      }
    }
  }
}
