import {
  Sequence,
  BeatDiv,
  Variable,
  Repetition,
  Terminal,
  Choice,
  choose,
} from '../types/ast/nodes'
import {
  ProcessorChain,
} from '../types/ast/functions/processors/processorChain'
import {
  LexicalTokenType,
  SemanticTokenType,
} from '../types/tokens'
import { ExpressionType } from '../types/expressions'
import { StatementType } from '../types/statements'

/**
 * "ain't it nice to live in an error-free world"
 *                           -- cin quai lee
 */
export class SecondPassParser {
  constructor(symbolTable, audioContext, options={}) {
    this.symbolTable  = symbolTable
    this.audioContext = audioContext
    this.options = {
      choiceFn: choose,
      ...options,
    }

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

  skipQueryParamTokens() {
    if (this.isLeftFnBracket()) {
      while (!this.isRightFnBracket()) { this.advance() }

      // now pop off left fn bracket
      this.advance()
    }
  }

  skipFnParameterTokens() {
    // TODO eventually this will have to handle nested function calls as
    // arguments (in the case of random and other numeric functions)
    this.skipQueryParamTokens()
  }
  
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
  isRightFnBracket() {
    return this.peek()
      && this.peek().type === SemanticTokenType.FnBracket
      && this.peek().value === '('    
  }
  isLeftFnBracket() {
    return this.peek()
      && this.peek().type === SemanticTokenType.FnBracket
      && this.peek().value === ')'    
  }
  isSoundLiteral() {
    return this.peek()
      && this.peek().type === SemanticTokenType.SoundLiteral
  }
  isVariable() {
    return this.peek()
      && this.peek().type === SemanticTokenType.Variable
  }
  isChainingOperator() {
    return this.peek()
      && this.peek().type === SemanticTokenType.ChainingOp
  }
  isPrefixRepetitionOperator() {
    return this.peek()
      && this.peek().type === SemanticTokenType.RepetitionOp
      && this.peek(-1)
      && this.peek(-1).type === LexicalTokenType.Number
  }
  isPostfixRepetitionOperator() {
    return this.peek()
      && this.peek().type === SemanticTokenType.RepetitionOp
      && this.peek(1)
      && this.peek(1).type === LexicalTokenType.Number
  }
  isRepetitionOperator() {
    return this.isPrefixRepetitionOperator()
      || this.isPostfixRepetitionOperator()
  }
  isChoiceOperator() {
    return this.peek()
      && this.peek().type === SemanticTokenType.ChoiceOp
  }
  isChoiceParam() {
    return this.peek()
      && this.peek().type === SemanticTokenType.FnBracket
      && this.peek(1)
      && this.peek(1).type === LexicalTokenType.Number
  }

  ///////////////
  //           //
  //  HELPERS  //
  //           //
  ///////////////

  normalize(choices, probabilities) {
    // TODO make more sophisticated to handle parameters and nulls.
    return choices.map(c => 1/choices.length)
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
      variable.define(new Terminal(this.consume()))
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
      steps.push(this.parseStepAndChoice())
    }

    return new Sequence(steps)
  }

  // returns a Sequence object
  parseSequence() {
    let steps = []

    // pop off left sequence bracket
    this.advance()
    
    while (!this.isRightSeqBracket()) {
      steps.push(this.parseStepAndChoice())
    }

    // pop off right sequence bracket
    this.advance()

    // parse processor chain if it exists.
    const processorChain = this.parseProcessorChain()
    
    return new Sequence(steps, processorChain)
  }

  // returns a BeatDivision object
  parseBeatDiv() {
    let steps = []

    // pop off left beat div bracket
    this.advance()
    
    while (!this.isRightBeatDivBracket()) {
      steps.push(this.parseStepAndChoice())
    }

    // pop off right beat div bracket
    this.advance()

    // parse processor chain if it exists.
    const processorChain = this.parseProcessorChain()
    
    return new BeatDiv(steps, processorChain)
  }

  
  // returns step
  parseStep() {
    let step = null
    
    if (this.isSoundLiteral()) {
      step = this.parseSoundLiteral()
    } else if (this.isVariable()) {
      step = this.parseVariable()
    } else if (this.isLeftSeqBracket()) {
      step = this.parseSequence()
    } else if (this.isLeftBeatDivBracket()) {
      step = this.parseBeatDiv()
    }

    // okay, after we've finished parsing the step, there may be some operation
    // we are applying to that step.
    
    if (this.isRepetitionOperator()) {
      step = this.parseRepetitionOperator(step)
    }

    return step
  }

  parseStepAndChoice() {
    let step = this.parseStep()

    if (this.isChoiceOperator())
      step = this.parseChoice(step)

    return step
  }

  parseRepetitionOperator(lhs) {
    if (this.isPrefixRepetitionOperator()) return this.parsePrefixRepetitionOperator(lhs)
    if (this.isPostfixRepetitionOperator()) return this.parsePostfixRepetitionOperator(lhs)
    
    throw new Error(`developer error.`)  // should never get here
  }

  parsePrefixRepetitionOperator(repetition) {
    // skip operator
    this.advance()

    // rhs could be any kind of step
    // TODO beware of sandwiched repetitions!
    // for example: 3 * flute * 3 will bite you maybe..... (this should
    // be handled in first-pass parser?)
    const repeatedNode = this.parseStep()

    return new Repetition(repeatedNode, repetition) 
  }
  
  parsePostfixRepetitionOperator(lhs) {
    // skip operator
    this.advance()

    // TODO enhance.
    // eventually the rhs could be a numeric function or
    // a variable or an arithmetic expression (of numbers
    // variables, and/or numeric functions)
    // but for now, it will just be a number. small steps.

    return new Repetition(lhs, new Terminal(this.consume()))
  }
  
  parseChoice(lhs) {
    let choices       = [lhs]
    let probabilities = []

    while (this.isChoiceOperator()) {
      // pop off choice operator
      this.advance()

      // get probability parameter if provided
      probabilities.push(this.parseChoiceParam())

      choices.push(this.parseStep())
    }

    // normalize probabilities
    probabilities = this.normalize(choices, probabilities)
    
    return new Choice(choices, probabilities, this.options.choiceFn)
  }

  parseChoiceParam() {
    let probability = null
    if (this.isChoiceParam()) {
      this.advance()
      probability = this.consume().value
      this.advance()
    }
    return probability
  }
  
  parseSoundLiteral() {
    const sound = this.consume()

    // pop off sound parameters
    // (querying is performed in first pass)
    this.skipQueryParamTokens()

    // check for chained functions
    const processorChain = this.parseProcessorChain()
     
    return new Terminal({...sound, fx: processorChain, ppqn: 1})
  }

  parseVariable() {
    const variable = this.symbolTable.getVariable(this.consume().value)

    // check for chained functions
    const processorChain = this.parseProcessorChain()
    
    return new Variable(variable, processorChain)
  }

  parseProcessorChain() {
    const chain = new ProcessorChain()
    
    while (this.isChainingOperator()) {
      // skip over chaining operator
      this.advance()

      chain.add(this.parseProcessor())
    }
    
    return chain.processors.length === 0 ? null : chain
  }

  parseProcessor() {
    const processor = this.symbolTable
          .getFunction(this.peek().value)
          .initialize(this.consume().parameters, {audioContext: this.audioContext})

    // pop off parameter tokens since ther were stored in the function name token.
    this.skipFnParameterTokens()

    return processor
  }
}
