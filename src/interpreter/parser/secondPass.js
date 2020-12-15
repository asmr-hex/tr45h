import { ExpressionType } from '../types/expressions'
import { StatementType } from '../types/statements'


export class SecondPassParser {
  constructor(symbolTable) {
    this.symbolTable = symbolTable

    // initialize internal state
    this.token  = { stream: [], index: 0 }
    this.block  = { key: null, index: null }
    this.result = { stmtType: null, ast: null }
  }

  //////////////////////
  //                  //
  //  INTERNAL STATE  //
  //                  //
  //////////////////////

  /**
   * resets the internal state with the output of semantic analysis.
   */
  reset({ stmtType, tokens, errors }, key, index) {
    this.token  = { stream: tokens, index: 0 }
    this.block  = { key, index }
    this.result = { stmtType, ast: null }
  }

  peek(skipAhead = 0) {
    const at = this.token.index + skipAhead
    return at <= (this.token.stream.length - 1) && at >= 0
      ? this.token.stream[at]
      : null
  }
  
  advance() { return this.token.stream[++this.token.index] || null }
  consume() { return this.token.stream[this.token.index++] || null }


  /**
   * entrypoint to second-pass parser.
   *
   * @description takes a semantic token stream and produces an abstract syntax
   * tree which can be executed directly by the scheduler. thie method parses one
   * block at a time of the provided program.
   *
   * @param {Object} tokens a map containing 'tokens', 'stmtType' & 'errors' keys.
   * @param {string} blockKey the block key of the block being parsed.
   * @param {int}    blockIndex the index of the block being parsed.
   * @return {ASTResult} the resulting AST for this statement block.
   */
  analyze(tokens, blockKey, blockIndex) {
    this.reset(tokens, blockKey, blockIndex)

    switch(tokens.stmtType) {
    case StatementType.Assignment:
      this.parseAssignment()
      break
    case StatementType.Sequence:
      break
    default:
      break
    }

    return this.result
  }

  parseAssignment() {
    const variable = this.symbolTable.getVariable(this.consume().value)

    // skip over assignment operator
    this.advance()
    
    switch (variable.assignedValueType) {
    case ExpressionType.Number:
      variable.define(this.consume().value)
      break
    case ExpressionType.Sequence:
      variable.define(this.parseSequence())
      break
    default:
      // we should never get here.
    }
  }

  parseSequence() {
    
  }
}
