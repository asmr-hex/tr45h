import React from  'react'
import {
  convertToRaw,
  SelectionState,
  Modifier,
  EditorState,
} from 'draft-js'
import { reduce, range } from 'lodash'
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
    let   blockText  = block.getText()
    const blockIndex = blockKeys.indexOf(blockKey)
    let decorations  = Array(blockText.length).fill(null)

    // EXPERIMENTAL
    // const entities = contentState.getEntityMap()
    // console.log(entities.__getAll())
    // WE WANT TO EXTRACT THE INLINE-SUGGESTION ENTITY AS ITS OWN TOKEN AND REMOVE FROM TEXT TO INTERPRETER.
    // THEN ADD IT TO TOKENS RESULTS FOR DECORATION.
    // block.getCharacterList().map(char => {
    //   const isSuggestion = char.getEntity()
    //   console.log(isSuggestion)
    //   return isSuggestion ? true : false
    // })
    // block.findEntityRanges(
    //   char => {
    //     const entityKey = char.getEntity()
    //     return (
    //       entityKey !== null &&
    //       contentState.getEntity(entityKey).getType() === 'INLINE-SUGGESTION'  
    //     )
    //   },
    //   (start, end) => console.log(`Suggestion At: ${start}:${end}`)
    // )

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
    
    let suggestion = null
    if (start !== null && end !== null) {
      suggestion = {
        type: 'SUGGESTION',
        value: blockText.substr(start, end),
        start,
        length: end - start,
      }
      // TODO IF THIS IS WHAT WE ARE DOING WE NEED TO REPLACE THE SUGGESTION TEXT WITH  ' ' INSTEAD OF COLLAPSING IT.
      blockText = blockText.substr(0, start) + ' '.repeat(suggestion.length) + blockText.substr(end+1)

      console.log(`SUGGESTION:     ${suggestion.value}`)
      
    }
    console.log(`NEW BLOCK TEXT: ${blockText}`)

    ////////////////////////////////
    
    // initialize map for this block type for use later (in getPropsforkey)
    this.highlighted = {}

    // parse cli text
    let tokens = this.cli.interpret(blockText)
    if (suggestion !== null) tokens.push(suggestion)

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
