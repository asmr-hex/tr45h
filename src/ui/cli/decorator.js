import React from  'react'
import {
  convertToRaw,
  SelectionState,
  Modifier,
  EditorState,
} from 'draft-js'
import { List } from 'immutable'


/**
 * CLIDecorator implements the DraftDecoratorType in Draftjs and uses our
 * interpreter to achieve syntax highlighting.
 *
 * @description 
 * see https://github.com/facebook/draft-js/blob/master/src/model/decorators/DraftDecoratorType.js
 * for more information on the type signature of DraftDecoratorType
 *
 * see https://gist.github.com/nodejh/a97228ad54ff24dacf72f3254ce0e082#file-prism-html-L48
 * for an example implementation of this type.
 */
export class CLIDecorator {

  /**
   * @param {Interpreter} interpreter the interpreter engine for the language.
   */
  constructor(cli, theme, setCurrentSuggestion) {
    this.cli         = cli
    this.highlighted = {}
    this.setCurrentSuggestion = setCurrentSuggestion

    this.theme = {}
    theme.subscribe(t => this.theme = t)  // subscribe to theme BehaviorSubject (rxjs)
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
    let decorations  = Array(blockText.length).fill(null)
    
    // initialize map for this block type for use later (in getPropsforkey)
    this.highlighted = {}

    // parse cli text
    const tokens = this.cli.interpret(blockText)

    for (const token of tokens) {
      const tokenId = `${token.start}`

      // store information about this token in map (for use in getPropsforKey)
      this.highlighted[tokenId] = token

      // set the component key for all char indices
      for (let i = token.start; i < token.start + token.length; i++) {
        decorations[i] = tokenId
      }      
    }

    return List(decorations)
  }
  
  /**
   * Given a decorator key, optionally return the props to use when rendering
   * this decorated range.
   *
   * @param {string} key a decorator key.
   * @return {Object} optional props object.
   */
  getPropsForKey(key) {
    return {
      token: this.highlighted[key]
    }
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
      return (
        <span className={this.theme.classes[props.token.type]}>{props.children}</span>
      ) 
    }
  }

}
