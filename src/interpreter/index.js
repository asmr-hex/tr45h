// import { BehaviorSubject } from 'rxjs' TODO uncomment when ready to use
import { debounce, map } from 'lodash'

import { Scheduler } from '../scheduler'

import { Lexer } from './lexer'
import { Parser } from './parser'
import { MemorySystem } from './memory'
import { SymbolTable } from './symbolTable'
import { AST } from './types/ast'


/**
 * the Interpreter is the main orchestrator for text analysis and evaluation.
 *
 * @description the interpreter orchestrates and delegates particular tasks to a
 * variety of subsystems: lexer, parser, symbol table, scheduler. Additionally, the
 * interpreter communicates bidirectionally with the text editor itself, both recieving
 * text to interpret and transmitting information about syntax highlighting.
 */
export class Interpreter {
  constructor(observables) {
    const {
      theme,
      transport,
    } = observables

    this.mem       = new MemorySystem()
    this.sym       = new SymbolTable(theme)
    this.lexer     = new Lexer()
    this.parser    = new Parser(this.sym)
    this.scheduler = new Scheduler(this.mem, this.sym, transport, theme)

    
    this.scheduler.start()

    //this.debouncedParse = debounce(this.parseBlock, 1000)
    this.memoizedParse = {}
  }

  /**
   * analyzes a single block of text. results are merged into the existing AST.
   *
   * @param {string} blockKey the key of the block to be interpreted.
   * @param {int} blockIndex the index of the block to be interpreted.
   * @param {string} blockText the text of the block to be interpreted.
   *
   * @return {LexicalAnlysisResults} used for syntax highlighting in the caller.
   * TODO when we introduce more language features, we will need to be returning
   * SemanticAnalysisResults since more advanced features will rely on semantic
   * analysis to return the proper error regions.
   */
  analyzeBlock(blockKey, blockIndex, blockText) {
    this.sym.clearBlockRefs(blockKey)
    
    const lexicalResults = this.lexer.tokenize(blockText, blockKey)

    const { stmtType, tokens, errors} = this.parser.firstPass(lexicalResults, blockKey, blockIndex)

    // perform debounced parsing. 
    this.debouncedParse({stmtType, tokens}, blockKey, blockIndex)

    this.sym.collectGarbage()
    
    return {stmtType, tokens, errors}
  }

  debouncedParse(semantics, blockKey, blockIndex) {
    if (!(blockKey in this.memoizedParse))
      this.memoizedParse[blockKey] = debounce(
        (s, k, i) => {
          const results = this.parser.secondPass(s, k , i)
          this.mem.set(k, results)
          delete this.memoizedParse[k]
        },
        1000,
      )
    
    this.memoizedParse[blockKey](semantics, blockKey, blockIndex)
  }
  
  // this is for debouncing
  parseBlock(lexicon, blockKey, blockIndex) {
    // perform semantic analysis
    const semantics = this.parser.analyzeStatement(lexicon)

    // update AST with semantic analysis results for this block (statement)
    this.ast.merge(semantics, blockKey, blockIndex)

    // signal to scheduler (evaluator) that symbol table and ast have changed!
    // TODO lets use rxjs here instead, so the scheduler can subscribe to these changes.
    this.scheduler.setAST(this.ast.program)
  }
}
