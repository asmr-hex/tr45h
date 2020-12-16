import {
  Sequence,
  BeatDiv,
  Terminal,
} from '../types/ast/nodes'
import {
  LexicalTokenType,
  SemanticTokenType,
} from '../types/tokens'
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

  
  /////////////////////
  //                 //
  //  QUERY METHODS  //
  //                 //
  /////////////////////

  isRightSeqBracket() {
    return this.peek()
      && this.peek().type === SemanticTokenType.SequenceBracket
      && this.peek().value === ')'
  }
  isRightBeatDivBracket() {
    return this.peek()
      && this.peek().type === SemanticTokenType.BeatDivBracket
      && this.peek().value === ']'    
  }
  isLeftSeqBracket() {
    return this.peek()
      && this.peek().type === SemanticTokenType.SequenceBracket
      && this.peek().value === '('
  }
  isLeftBeatDivBracket() {
    return this.peek()
      && this.peek().type === SemanticTokenType.BeatDivBracket
      && this.peek().value === '['    
  }
  isSoundLiteral() {
    return this.peek()
      && this.peek().type === SemanticTokenType.SoundLiteral
  }
  isVariable() {
    return this.peel()
      && this.peek().type === SemanticTokenType.Variable
  }
  isRepetitionOperator() {
    return false  // TODO impl me
  }
  isChoiceOperator() {
    return false  // TODO impl me
  }

  /////////////////////
  //                 //
  //  PARSE METHODS  //
  //                 //
  /////////////////////
  
  
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
      variable.define(this.parseSequenceExpr())
      break
    default:
      // we should never get here.
    }
  }

  parseSequenceExpr() {
    let steps =  []

    while (this.peek()) {
      steps.push(this.parseStep())
    }

    return new Sequence(steps)
  }

  // returns a Sequence object
  parseSequence() {
    let steps = []

    // pop off left sequence bracket
    this.advance()
    
    while (!this.isRightSeqBracket()) {
      steps.push(this.parseStep())
    }

    // pop off right sequence bracket
    this.advance()
    
    return new Sequence(steps)
  }

  // returns a BeatDivision object
  parseBeatDiv() {
    let steps = []

    // pop off left beat div bracket
    this.advance()
    
    while (!this.isRightBeatDivBracket()) {
      steps.push(this.parseStep())
    }

    // pop off right beat div bracket
    this.advance()
    
    return new BeatDiv(steps)
  }

  
  // returns step
  parseStep() {
    let step = null
    
    if (this.isSoundLiteral()) {
      step = this.parseSoundLiteral()
    } else if (this.isVariable()) {
      
    } else if (this.isLeftSequenceBracket()) {
      
    } else if (this.isLeftBeatDivBracket()) {
      
    }

    // okay, after we've finished parsing the step, there may be some operation
    // we are applying to that step.
    
    if (this.isRepetitionOperator()) {
      
    } else if (this.isChoiceOperator()) {
      
    }

    return step
  }


  parseSoundLiteral() {
    const sound = this.consume()

    // TODO pop off sound parameter stuff we don't need anymore.

    // also... check for chained functions!
    // and include processor chains
    const fxChain = [] // TODO change this

    return new Terminal({...sound, fx: fxChain, ppqn: 1})
  }
  
}
