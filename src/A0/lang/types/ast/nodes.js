import { cloneDeep, reduce } from 'lodash'

import {
  LexicalTokenType,
  SemanticTokenType,
} from '../tokens'
import { NotImplementedError } from '../error'


/**
 * Step is a data-type which represents a fully-resolved step in a sequence.
 *
 * @description it contains information about:
 *  * ppqn
 *  * applied fx
 */
// {type: 'sound', value: "maybe its a multiword string", fx: [], ppqn: 32}

/**
 * ASTNode is an abstract class representation for a node in the AST.
 *
 * @description this abstract class is extended by more specific node types
 * in the AST and defines the interface in which all nodes in the AST interact
 * with one another. The interface is defines is:
 *  current() - a method which returns the current fully resolved step
 *  next()    - a method which returns the next fully resolved step
 *  advance() - a method which advances the current unresolved step and 
 *              current/next fully resolved steps.
 */
export class ASTNode {
  /**
   * initializes the current/next fully resolved steps.
   *
   * @description on initialization, the current and next steps are equal.
   *
   * @param {Step} initialStep the initial fully resolved step.
   */
  constructor(initialStep) {
    // _current and _next are the fully resolved current and next steps
    this._current = initialStep
    this._next = initialStep
  }

  /**
   * current is a getter method for getting the fully resolved current step.
   *
   * @returns {Step} the current fully resolved step
   */
  current() { return this._current }

  /**
   * next is a getter method for getting the fully resolved next step.
   *
   * @returns {Step} the next fully resolved step
   */
  next() { return this._next }

  /**
   * returns the length of the node, i.e. the number of steps contained within.
   */
  length() { throw new NotImplementedError('length()') }
  
  /**
   * advance is an unimplemented method for advancing the current and next fully resolved steps.
   *
   * @returns {bool} true if advancing has 'cycled' its step stream, false otherwise.
   */
  advance() { throw new NotImplementedError('advance()') }
}


/**
 * Terminal represents a leaf node in the AST.
 */
export class Terminal extends ASTNode {
  /**
   * sets the current and next steps to one step.
   */
  constructor(step) { super(step) }

  /**
   * 'advances' the terminal to the next step in the step stream.
   *
   * @description since a terminal consists of only one step, no actual advancing is done.
   * i.e. the current and next values remain the same (and are equal to eachother). This
   * implementation always returns true because advancing a terminal step always cycles.
   *
   * @returns {true} a terminal step always 'cycles' when advanced.
   */
  advance() { return true }

  length() { return 1 }
}


/**
 * NonTerminal represents an intermediary node within the AST.
 *
 * @description since a nonterminal AST node can be a sequence or choice of some
 * child AST nodes, advancing an intermediary node is more complex than advancing
 * a terminal AST node. This is because an NonTerminal AST node can be composed of
 * a stream of AST Nodes (not simply Terminal AST nodes). For this reason, a NonTerminal
 * must keep track of the current AST Node (either Terminal or NonTerminal).
 */
export class NonTerminal extends ASTNode {
  /**
   * constructs a NonTerminal.
   *
   * @param {ASTNode} currentNode the current AST Node of this NonTerminal.
   */
  constructor(currentNode) {
    // initialize the current step to be the current step of the current AST Node.
    super(currentNode.current())

    // set the current node
    this._currentNode = currentNode
  }

  /**
   * advances the current an next steps forward and potentially sets the currentNode to a new value.
   *
   * @description since a NonTerminal can be composed of a stream of ASTNodes (Terminal or NonTerminal),
   * when advancing, we need to determine whether the currentNode has cycled. If it has, we need to
   * update the currentNode (by calling advanceCurrentNode). But, if in advancing the currentNode
   * this NonTerminal itself cycles, we need bubble that up to the parent of this NonTerminal. Note that
   * a precondition for this NonTerminal cycling, is that its currentNode has to have cycled also.
   *
   * @returns {bool} true if this Nonterminal, itself, has cycled, false otherwise.
   */
  advance() {
    let thisHasCycled = false

    // if the current AST node has cycled, we must advance the currentNode
    if ( this._currentNode.advance() )
      thisHasCycled = this.advanceCurrentNode()

    this._current = this._next
    this._next = this._currentNode.next()
    return thisHasCycled
  }

  /**
   * an abstract method which advances the current ASTNode (currentNode) and reports cycling information.
   *
   * @returns {bool} if this NonTerminal, itself, has cycled while advancing its currentNode.
   */
  advanceCurrentNode() { throw new NotImplementedError('advanceCurrentNode()') }

  length() { return this._currentNode.length() }
}

/**
 * NOTE: each variable needs to be its own copy of the one in the symbol table
 * because each instance of the variable will have its own independent internal
 * sequence state...
 * So, we need to watch out for this becoming very memory intensive....aka how
 * does this scale with many instance variables? maybe an alternative could be reworking
 * ast node classes to make it possible to keep track of internal state independently
 * (so we don't need tons of instances of deeply nested AST nodes, but rather multiple
 * internal state pointers which tell each instance which is the current node etc.)
 * this will PROBABLY be really useful in the future anyway when we are trying to have
 * more graceful way sto append new steps in a sequence for example.....
 *
 * BUT for now.... we maintain each copy... we will have to somehow update each copy
 * if the original variable is redefined....but maybe we can punt on that for now
 * or at least until we understand if this one-copy-per-instance approach is super
 * inefficient or not.
 */
export class Variable extends NonTerminal {
  constructor(variableSymbol, procChain=null) {
    super(cloneDeep(variableSymbol.resolve().value))  // deep clone.....

    this._variable = variableSymbol
    this._processChain = procChain
  }

  advanceCurrentNode() {
    return true  // whenever this method is called, the assigned value has always cycled.
  }
}

export class Sequence extends NonTerminal {
  constructor(seq, procChain=null) {
    super(seq[0])
    
    this._currentNodeIndex = 0
    this._seq = seq
    this._processChain = procChain

    // attach all children to parent process chain.
    for (const step of this._seq) {
      if (step.current().fx && this._processChain) {
        step.current().fx.add(this._processChain)
      } else if (this._processChain) {
        step.current().fx = this._processChain
      }
    }
  }

  advanceCurrentNode() {
    let hasCycled = false
    if ( this._currentNodeIndex === this._seq.length - 1 ) {
      this._currentNodeIndex = 0
      hasCycled = true
    } else {
      this._currentNodeIndex += 1
    }

    this._currentNode = this._seq[this._currentNodeIndex]

    return hasCycled
  }

  length() {
    return reduce(
      this._seq,
      (acc, n) => {
        // the actual length of a sequence can be different if the steps are either
        // a variable, repetition, or choice
        const isVariableRepetitionOrChoice =
              n instanceof Variable   ||
              n instanceof Repetition ||
              n instanceof Choice
        return acc + (isVariableRepetitionOrChoice ? n.length() : 1)
      },
      0
    )
  }
}

export class Repetition extends NonTerminal {
  constructor(node, repetitionScheme) {
    super(node)

    this._repetitionScheme = repetitionScheme

    this._currentCount = 0
    this._repetitions  = this._getRepetitions()
  }

  _getRepetitions() {
    const scheme = this._repetitionScheme.current()
    switch (scheme.type) {
    case LexicalTokenType.Number:
      return scheme.value
    case SemanticTokenType.Fn:
      // do something to update the function (like if its random then get a new random number)
    default:
      // idk
    }
  }

  advanceCurrentNode() {
    let hasCycled = false
    if ( this._currentCount === this._repetitions - 1 ) {
      this._currentCount = 0
      this._repetitions = this._getRepetitions()
      hasCycled = true
    } else {
      this._currentCount += 1
    }

    return hasCycled
  }

  length() {
    return this._currentNode.length() + this._getRepetitions()
  }
}

// we don't know the ppqn until we bubble up....
// which means that, when its evaluation time, we pass the context to
// actually set the ppqn on the terminals.
export class BeatDiv extends Sequence {
  current() {
    return {
      ...this._current,
      ppqn: this._current.ppqn * this.length()
    }
  }

  next() {
    return {
      ...this._next,
      ppqn: this._next.ppqn * this.length()
    }
  }
}

export const choose = (choices, cdf) =>
  choices[cdf.filter(c => c <= Math.random() * cdf[cdf.length - 1]).length]

export class Choice extends NonTerminal {
  constructor(choices, pdf, choiceFn = choose) {
    // derive the cumulative distribution function
    let acc = 0
    const cdf = pdf.map(p => (acc = p + acc))

    super(choiceFn(choices, cdf))
    
    this._choices = choices
    this._pdf = pdf
    this._cdf = cdf
    this._choose = choiceFn
  }
  
  advanceCurrentNode() {
    // probabilistically choose a new choice for _currentUnresolved
    this._currentNode = this._choose(this._choices, this._cdf)

    return true
  }
  
}
