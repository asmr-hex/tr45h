import { filter, range, reduce } from 'lodash'
import {
  EditorState,
  Modifier,
  SelectionState,
  convertToRaw,
} from 'draft-js'


// TODO refactor this....to be more understandable...

export class AutoSuggest {
  constructor({ tokens, dictionary, suggestions }) {
    this.tokens         = tokens
    this.setSuggestions = suggestions.set
    this.inline         = suggestions.inline
    this.suggestOnEmpty = suggestions.suggestOnEmpty
    this.dictionary     = dictionary

    this.anchorToken = null
    
    this.suggestions = {
      current: null,
      candidates: [],
    }
  }

  analyze(editorState) {
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
    
    // TODO is the token a suggestion candidate?
    let contexts = ['symbols.sounds']
    // if ('contexts' in token.suggest) {
    //   contexts = token.suggest.contexts
    // }
    
    // what are the top suggestion matches for this token?
    const suggestions = this.getSuggestions(contexts, token)

    if (suggestions.length === 0) {
      this.updateSuggestions(null, [])
      return newEditorState 
    }

    console.log(suggestions)
    
    // take the first suggestion
    const newEditorStateWithSuggestion = this.insertSuggestion(token, suggestions[0], newEditorState)

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

    // is offset within a token?
    const token = this.getBoundingToken(key, offset)
    if (token === null) {
      this.updateSuggestions(null, [])
      return newEditorState 
    }

    const newEditorStateWithCompletion = this.insertAutoCompletion(token, this.suggestions.current, newEditorState)

    return newEditorStateWithCompletion
  }

  insertAutoCompletion(token, suggestion, editorState) {
    // get non-overlapping suffix of suggestion
    const remainder = suggestion.substr(token.value.length)
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
    
    const editorStateWithoutSuggestion = EditorState.set(
      editorState,
      { currentContent: contentStateWithoutSuggestion },
    )

    return EditorState.forceSelection(editorStateWithoutSuggestion, selection)
  }
  
  insertSuggestion(token, suggestion, editorState) {
    // if (suggestions.length === 0) return editorState
    // const suggestion = suggestions[0]
    
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

    const editorStateWithSuggestion = EditorState.set(
      editorState,
      { currentContent: contentStateWithSuggestion },
    )

    return EditorState.forceSelection(editorStateWithSuggestion, selection)
  }
  
  getBoundingToken(key, offset) {
    // handle default suggestions (on empty)
    if (this.suggestOnEmpty && (this.tokens[key] === undefined || this.tokens[key].length === 0)) {
      this.anchorToken = { value: '', suggest: { contexts: ['symbols.sounds'] }, start: 0, length: 0 }
      return this.anchorToken
    }
    
    const tokens = filter(
      this.tokens[key],
      v => (offset >= v.start && offset <= (v.start + v.length) && v.type !== 'INLINE-SUGGESTION')
    )
    this.anchorToken = tokens.length === 0 ? null : tokens[0]
    return this.anchorToken
  }

  getSuggestions(contexts, token) {
    return this.dictionary.suggest(token.value, contexts)
  }
}
