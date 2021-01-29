import React from  'react'
import { SelectionState } from 'draft-js'
import { List } from 'immutable'

import { AutoSuggest } from './autosuggest'


/**
 * SyntaxHighlightDecorator implements the DraftDecoratorType in Draftjs and uses our
 * interpreter to achieve syntax highlighting.
 *
 * @description 
 * see https://github.com/facebook/draft-js/blob/master/src/model/decorators/DraftDecoratorType.js
 * for more information on the type signature of DraftDecoratorType
 *
 * see https://gist.github.com/nodejh/a97228ad54ff24dacf72f3254ce0e082#file-prism-html-L48
 * for an example implementation of this type.
 */
export class Decorator {

  /**
   * @param {Interpreter} interpreter the interpreter engine for the language.
   */
  constructor(interpret, getTokenStyles, dictionary, setSuggestions, triggerSuggest) {
    this.interpret      = interpret
    this.getTokenStyles = getTokenStyles
    this.tokens         = {}
    this.autosuggest    = new AutoSuggest({
      tokens: this.tokens,
      dictionary,
      suggestions: {
        set:     setSuggestions,
        trigger: triggerSuggest,
      }
    })
  }
  
  /**
   * Given a `ContentBlock`, return an immutable List of decorator keys.
   *
   * @description this annotates each character in each block with its particular
   * decorator key. Importantly, this is run only on blocks that are modified. Thus,
   * it is convenient to run reparsing on a particular block here, since each block
   * (at this point) corresponds to one statement(1). Its also important to note that
   * this method is run before the main onChange function invoked by the editor.
   *
   * The details about when this function is executed are important, particularly there
   * are some important edge-cases to understand:
   *  * when an entire block is deleted, this will not be executed for that block (makes sense).
   *
   *  * when a block is split into two separate blocks (by inserting a carriage return), this function
   *    is run for both blocks.
   *
   * The general rule for this method being executed is it is executed for any blocks that are modified.
   * This means that in the first edge case described above, if a block is deleted (either by selecting the
   * entire line and deleting or if it only contained one character and that character is deleted) and no
   * other modifications are made to other remaining blocks, then this method *will not be* executed. For
   * this reason, we can prune the AST in the main editor's onChange handler when block deletions have been
   * detected. And in this method, we can focus on reparsing (not pruning).
   *
   * @param {BlockNodeRecord} block a Draftjs `ContentBlock`.
   * @param {ContentState} contentState the Draftjs `ContentState`.
   * @return {List<string>} an immutable List of decorator keys.
   */
  getDecorations(block, contentState) {
    const blockKeys   = contentState.getBlocksAsArray().map(b => b.key)
    const blockKey   = block.getKey()
    const blockText  = block.getText()
    const blockIndex = blockKeys.indexOf(blockKey)
    if (blockText.trim() === '') return
    let decorations  = Array(blockText.length).fill(null)

    // handle autosuggestion entities
    const { suggestions, text } = this.extractSuggestions(block)
    
    // initialize map for this block type for use later (in getPropsforkey)
    this.tokens[blockKey] = {}
    
    // interpret text in this block.
    // TODO standardize output....include metadata output (something to control like line style??)
    const { tokens = [] } = this.interpret(blockKey, blockIndex, blockText)
    
    for (const token of [ ...suggestions, ...tokens ]) {
      const tokenId      = `${token.start}`             // block-relative token id
      const componentKey = `${blockKey}-${token.start}` // block-scoped token id

      // store information about this token in map (for use in getPropsforKey)
      this.tokens[blockKey][tokenId] = token

      // set the component key for all char indices
      for (let i = token.start; i < token.start + token.length; i++) {
        decorations[i] = componentKey
      }      
    }

    return List(decorations)
  }

  extractSuggestions(block) {
    const blockText = block.getText()
    let suggestions = []
    let text        = blockText

    const push = s => {
      s.value  = blockText.substr(s.start, s.end)
      s.length = s.end - s.start
      suggestions.push(s)

      // replace entity characters with empty space (so its not parsed)
      text = text.substr(0, s.start) + ' '.repeat(s.length) + text.substr(s.end+1)

      return {type: null, start: null, end: null}
    }
    
    let suggestion = {type: null, start: null, end: null}
    for (let i = 0; i < block.getLength(); i++) {
      const entity = block.getEntityAt(i)

      // if there is no entity or the entity type is different from the current suggestion
      // then we will push the current suggestion and begin a new one.
      if (entity === null || entity.getType() !== suggestion.type) {
        if (suggestion.start !== null & suggestion.end !== null)
          suggestion = push(suggestion)
        continue
      }

      if (suggestion.start === null) {
        suggestion.start = i
        suggestion.type  = entity.getType()
      }

      suggestion.end = i + 1

      if (i === block.getLength() - 1) push(suggestion)
    }

    return { suggestions, text }
  }
  
  /**
   * Given a decorator key, optionally return the props to use when rendering
   * this decorated range.
   *
   * @param {string} key a decorator key.
   * @return {Object} optional props object.
   */
  getPropsForKey(key) {
    const [ blockKey, tokenId ] = key.split('-')
    const token = this.tokens[blockKey][tokenId]
    return { token }
  }
  
  /**
   * Given a decorator key, return the component to use when rendering 
   * this decorated range.
   *
   * @param {string} key a decorator key
   * @return {Function} the component to use when rendering decorated range.
   */
  getComponentForKey(key) {
    return props => {
      const {
        classes = [],
        styles  = {},
      } = this.getTokenStyles(key, props.token)

      return (
        <span className={classes.join(' ')}>{props.children}</span>
      ) 
    }
  }

  suggest(newEditorState) {
    return this.autosuggest.analyze(newEditorState)
  }
}
