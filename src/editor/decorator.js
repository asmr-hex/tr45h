import React from  'react'
import { List } from 'immutable'


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
export class SyntaxHighlightDecorator {

  /**
   * @param {Interpreter} interpreter the interpreter engine for the language.
   */
  constructor(interpreter) {
    this.interpreter = interpreter
    this.highlighted = {}
  }

  /**
   * Given a `ContentBlock`, return an immutable List of decorator keys.
   *
   * @param {BlockNodeRecord} block a Draftjs `ContentBlock`.
   * @param {ContentState} contentState the Draftjs `ContentState`.
   * @return {List<string>} an immutable List of decorator keys.
   */
  getDecorations(block, contentState) {
    const blockType = block.getType()
    const blockKey  = block.getKey()
    const blockText = block.getText()
    let decorations = Array(blockText.length).fill(null)

    // initialize map for this block type for use later (in getPropsforkey)
    this.highlighted[blockKey] = {}

    // we simply create a decoratorKey for each character?
    const { errors, tokens } = this.interpreter.lexer.tokenize(blockText)

    for (const token of tokens) {
      const tokenId = `token${token.start}`
      const componentKey = `${blockKey}-${tokenId}`

      // store information about this token in map (for use in getPropsforKey)
      this.highlighted[blockKey][tokenId] = token

      // set the component key for all char indices
      for (let i = token.start; i < token.start + token.length; i++) {
        decorations[i] = componentKey
      }
    }

    return List(decorations)
  }

  /**
   * Given a decorator key, return the component to use when rendering 
   * this decorated range.
   *
   * @param {string} key a decorator key
   * @return {Function} the component to use when rendering decorated range.
   */
  getComponentForKey(key) {
    return props => (
      <span className={props.token.type}>{props.children}</span>
    ) 
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
    const token = this.highlighted[blockKey][tokenId]

    return {
      token
    }
  }
}
