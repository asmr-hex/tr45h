import { Lexer } from './lexer'
import { SymbolTable } from './symbols'

export const interpret = str => {
  const lexer = new Lexer()
  const lexed = lexer.tokenize(str)
  
  return ["hi"]
}


export class Interpreter {
  constructor() {
    this.symbols = new SymbolTable()
    this.text = null
    this.ast = null // TODO initialize an empty AST
  }

  /**
   * analyze takes a new text state and updates the AST.
   *
   * @description
   *
   * TODO 
   * QUESTION: 
   * how can we design this in the naive approach (reparse everything)
   * in a way that will easily allow us to swap out for the more optimized
   * version?
   *
   * DISCUSSION:
   * (1) in analyze, call a function to determine the diffed region - initially it can return everything.
   * (2) then have a function which determines the node of the current AST that this region belongs to -- initially it should be the root node
   * (3) then, have a function that determines the text region which belongs to that node
   * NOTE: this actually boils down to how we design the AST. The AST will basically be a wrapper/container for all the
   *       ast nodes we've defined.
   *      
   * TODO optimizations can include:
   *  (1) determining the diff
   *  (2) determining the minimal AST node containing the diff
   *  (3) parse the text region corresponding to the minimal AST node
   *  (4) replace that AST node
   */
  analyze(newText) {
    // get textual diff
    const textDiff = this.diff(newText, this.text)

    // get affected ast nodes and the corresponding text blocks to reparse
    const astDiff = this.ast.diff(textDiff)

    for (const change of astDiff) {
      // reparse
      const newNode = this.parser.analyze(change.text)

      // replace ast node with new node
      this.ast.replace(change.node, newNode)
    }

    // we done.
  }

  /**
   * diff determines the diffed regions of text.
   *
   * @description there are multiple types of diffs that are possible which result from 
   *
   * @param {idk} newText the new text state
   * @param {idk} oldText the old text state
   *
   * @return {idk} the regions of text that are different now.
   */
  diff(newText, oldText) {
    // TODO use jsdiff (https://www.npmjs.com/package/diff)
    
    return null
  }
}
