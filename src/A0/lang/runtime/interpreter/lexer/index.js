import { min, max } from 'lodash'

import {
  newLexicalToken,
  LexicalTokenType,
  SeparatorBalanceError,
  SeparatorMismatchError,
  QuoteMissingError,
} from 'A0/lang/types'


// TODO refactor all try/catch statements in the tokenize statements to just directly
// push the errors to the error stack.

/**
 * Lexer tokenizes an input string.
 *
 * @description Since we will be live lexing, it is important that our program is robust to
 * lexical errors, i.e. errors are contained to upperbound regions and lexing can continue
 * if possible. Ultimately, we would like to report the lexical errors to the musician while
 * allowing the correct parts of their program to run. To achieve this, lets enumerate the types
 * of errors that can occur in the lexing phase:
 *
 *   * QuoteMissingError - this will only happen when a quote has been opened but not closed.
 *                         so, recovering from this error means that everything after the opening
 *                         quote must be included in the error region.
 *
 *   * SeparatorBalanceError - this will occur in two scenarios:
 *                               (1) a closing separator has occured before it was opened. in this case,
 *                                   we can actually just mark this separator as an error region, ignore
 *                                   it and continue lexing. (dangling closing separator)
 *                               (2) the end of a line has occured and one or more opening separators were
 *                                   not closed. Unfortunately, the only way to guarantee the program can
 *                                   continue, is if we mark everything from the first unbalanced separator
 *                                   as an error region. Note that this case will occur at the end of the
 *                                   lexing loop.
 *
 *   * SeparatorMismatchError - this will occur if a separator is closed with the wrong separator type.
 *                              this can occur inthe middle of lexing, but can be recovered from. in order
 *                              to recover, we will set the error region to the last (mismatched) open separator
 *                              pop from the open separator stack, and continue lexing. Below are some examples
 *                              with the error regions highlighted.
 *                                  ______________    
 *                              ( a { a [ a  a } ] a a )
 *                                      ________
 *                              ( a { a [ a  a } } a a )
 *
 * @throws {SeparatorBalanceError} Parenthesis, Square Brackets, or Curly Braces are unbalanced.
 * @throws {SeparatorMismatchError} Parenthesis, Square Brackets, or Curly Braces are mismatched.
 * @throws {QuoteMissingError} There is a missing quote.
 */
export class Lexer {
  constructor() {
    this.reset()
  }

  /**
   * reset sets all appropriate variables to their 0-values to
   * prepare for another lexing pass.
   */
  reset(blockKey='') {
    this.input  = ''
    this.tokens = []
    this.char   = null
    this.index  = 0
    this.errorRegions = []
    this.block = blockKey
  }

  /**
   * lex takes a chunk of code and performs lexical analysis on it
   *
   * @param {string} input  a chunk of code to perform lexical analysis on
   * @return {Array<token>} an array of tokens
   */
  tokenize(input, blockKey='') {
    this.reset(blockKey)
    this.input = input
    let sepStack = []  // TODO rename to brackStack ;)
    const lSeps =`([`
    const rSeps = `)]`

    // TODO !!! handle paren and bracket balance checks in this code! THIS WILL ensure that we don't proceed
    // with parsing if we have unbalanced stuff!
    // do something like this! https://riptutorial.com/python/example/25649/parsing-parentheses
    // as we go through each token!

    // scan through entire string character by character.
    while (this.index < input.length) {
      this.char = this.input[this.index]

      
      //////////////////
      //              //
      //  WHITESPACE  //
      //              //
      //////////////////
      
      if (this.isWhiteSpace(this.char)) {
        this.advance()
      }

      /////////////////////
      //                 //
      //  MUTE OPERATOR  //
      //                 //
      /////////////////////

      else if (this.isMuteOperator(this.char)) {
        this.addToken({
          type: LexicalTokenType.MuteOp,
          value: this.char,
          start: this.index,
          length: 1,
        })
        this.advance()        
      }

      /////////////////////
      //                 //
      //  SOLO OPERATOR  //
      //                 //
      /////////////////////

      else if (this.isSoloOperator(this.char)) {
        this.addToken({
          type: LexicalTokenType.SoloOp,
          value: this.char,
          start: this.index,
          length: 1,
        })
        this.advance()        
      }
      
      ////////////////
      //            //
      //  COMMENTS  //
      //            //
      ////////////////
      
      else if (this.isComment(this.char)) {
        let comment = this.input.substring(this.index, this.input.length)
        const start = this.index
        this.addToken({
          type: 'COMMENT',
          value: comment,
          start,
          length: this.input.length - start,
          block: blockKey,
        })
        this.index = this.input.length
      }

      
      //////////////////
      //              //
      //  SEPARATORS  //
      //              //
      //////////////////
      else if (this.isSeparator(this.char)) {
        this.addToken({
          type: LexicalTokenType.Separator,
          value: this.char,
          start: this.index,
          length: 1,
        })
        this.advance()        
      }

      ////////////////
      //            //
      //  BRACKETS  //
      //            //
      ////////////////

      // TODO refactor this monstrosity.
      else if (this.isBracket(this.char)) {
        // perform balanced separator check
        const separator = {value: this.char, location: this.index}
        if (/[([]/.test(this.char)) {
          // push open separator to stack
          sepStack.push(separator)
        }
        else if (/[)\]]/.test(this.char)) {
          // handle potential error regions
          try {
            // dangling closing separator?
            if (sepStack.length === 0) throw new SeparatorBalanceError(separator)            
          } catch(e) {
            // since this is just a dangling closing separator, we can mark it as an
            // error region and continue lexing.
            this.errorRegions.push({start: this.index, length: 1, reason: e})
            this.advance()
            continue
          }

          // pop closing separator from stack
          const stackTop = sepStack.pop()
          // handle potential error regions
          try {
            // ensure it is the proper type of closing separator
            if (stackTop.value !== lSeps[rSeps.indexOf(this.char)])
              throw new SeparatorMismatchError(stackTop, separator)            
          } catch (e) {
            // this is a mismatched separator error. we need to mark from this
            // character to the previous mismatched open separator as an error region,
            // but we can continue to try to lex.
            this.errorRegions.push({start: stackTop.location, length: (this.index + 1) - stackTop.location, reason: e})
            this.advance()
            continue
          }

        }
        this.addToken({
          type: LexicalTokenType.Bracket,
          value: this.char,
          start: this.index,
          length: 1,
        })
        this.advance()
      }

      
      //////////////
      //          //
      //  QUOTES  //
      //          //
      //////////////
      
      else if (this.isQuote(this.char)) {
        // arguably, we could be doing the 'collection' of quoted strings during
        // parsing, but since strings can not be recursive, then it is probably
        //easier to tokenize them immediately here.
        let stringToken = ``
        const quoteType = this.char
        const start = this.index
        const isValidQuoteBody = c => {
          if ( c === undefined ) throw new QuoteMissingError(start)
          return !(this.isQuote(c) && c === quoteType)
        }
        
        // handle potential errors
        try {
          while (isValidQuoteBody(this.advance())) stringToken += this.char  
        } catch(e) {
          if (e instanceof QuoteMissingError) {
            // since a missing quote can only happen at the end of a line,
            // we will package up the error and return from here
            this.errorRegions.push({start, length: stringToken.length + 1, reason: e})
            
            // dedupe error regions and remove tokens from error regions
            this.dedupeErrorRegions(blockKey)
            this.removeErrorTokens()
            
            return { errors: this.errorRegions, tokens: this.tokens }
          }
        }

        // only add the token if the stringToken is not just whitespace
        if (stringToken.trim() !== "") {
          this.addToken({
            type: LexicalTokenType.String,//'IDENTIFIER',
            value: stringToken,
            start: start,
            length: stringToken.length + 2, // add 2 for open/close quotes
            block: blockKey,
          })
        }

        this.advance()
      }


      /////////////////
      //             //
      //  OPERATORS  //
      //             //
      /////////////////
      
      else if (this.isOperator(this.char)) {
        this.addToken({
          type: 'OPERATOR',
          value: this.char,
          start: this.index,
          length: 1,
          block: blockKey,
        })
        this.advance()
      }


      ////////////////////
      //                //
      //  NUMBERS & HZ  //
      //                //
      ////////////////////
      
      else if (this.isDigit(this.char)) {
        let num = this.char
        const start = this.index
        while (this.isDigit(this.advance())) num += this.char
        // tokenize fractional numbers
        if (this.char === '.') {
          num += this.char
          while (this.isDigit(this.advance())) num += this.char
        }

        num = parseFloat(num)
        const isInHz = this.isHzUnit(this.char, this.peek(1))

        this.addToken({
          type: isInHz ? 'HZ' : 'NUMBER',
          value: num,
          start,
          length: this.index - start,
          block: blockKey,
        })

        if (isInHz) {
          this.addToken({
            type: 'HZ_UNIT',
            value: this.char + this.advance(),
            start: this.index - 1,
            length: 2,
            block: blockKey,
          })

          this.advance()
        }
      }

      
      ///////////////////
      //               //
      //  IDENTIFIERS  //
      //               //
      ///////////////////
      
      else if (this.isIdentifier(this.char)) {
        let identifier = this.char
        const start = this.index
        while (this.isIdentifier(this.advance())) identifier += this.char
        this.addToken({
          type: 'IDENTIFIER',
          value: identifier,
          start,
          length: identifier.length,
          block: blockKey,
        })
      }


      //////////////////////////
      //                      //
      //  INVALID CHARACTERS  //
      //                      //
      //////////////////////////
      
      else {
        // handle errors somehow?
      }
    }

    // make sure that all separators have been balanced
    try {
      if (sepStack.length !== 0) throw new SeparatorBalanceError(sepStack[0])      
    } catch(e) {
      // sadly the line ended with unbalanced separators. we need to mark everything from
      // the first unbalanced separator to the end as an error region.
      this.errorRegions.push({start: sepStack[0].location, length: this.input.length - sepStack[0].location, reason: e})
    }

    // dedupe error regions and remove tokens from error regions
    this.dedupeErrorRegions(blockKey)
    this.removeErrorTokens()
    
    return {
      errors: this.errorRegions,
      tokens: this.tokens,
    }
  }

  dedupeErrorRegions(blockKey) {
    const errorRegions = []
    
    for (const error of this.errorRegions) {
      let overlappingRegion = false
      // does this error overlap with any of the previous error regions?
      for (let i = 0; i < errorRegions.length; i++) {
        const r = this.rangeOverlaps(error, errorRegions[i])
        if (r.overlap) {
          overlappingRegion = true
          errorRegions[i] = {
            ...errorRegions[i],
            start: r.min,
            length: (r.max + 1) - r.min,
            reasons: [...errorRegions[i].reasons, error.reason],
          }
          break
        }
      }
      if (!overlappingRegion)
        errorRegions.push({
          type: 'ERROR',
          start: error.start,
          length: error.length,
          reasons: [error.reason],
          tokens: [],
          block: blockKey,
        })
    }

    this.errorRegions = errorRegions
  }

  /**
   * removes tokens that occur in error regions, but preserves their existence in the errors.
   */
  removeErrorTokens() {
    const tokens = []
    for (const token of this.tokens) {
      let inErrorRegion = false
      for (let i = 0; i < this.errorRegions.length; i++) {
        const r = this.rangeOverlaps(token, this.errorRegions[i])
        if (r.overlap) {
          inErrorRegion = true
          this.errorRegions[i].tokens.push(token)
          break
        }
      }

      if (!inErrorRegion)
        tokens.push(token)
    }

    this.tokens = tokens
  }
  
  rangeOverlaps(x, y) {
    const a = [ x.start, x.start + x.length - 1 ]
    const b = [ y.start, y.start + y.length - 1 ]
    let overlap = false
    if ( (a[0] >= b[0] && a[0] <= b[1]) ||
         (a[1] >= b[0] && a[1] <= b[1]) ||
         (b[0] >= a[0] && b[0] <= a[1]) ||
         (b[1] >= a[0] && b[1] <= a[1]) )
      overlap = true
    
    return {
      overlap,
      min: min([...a, ...b]),
      max: max([...a, ...b]),
    }
  }
  
  advance() { return this.char = this.input[++this.index] }
  peek(skip=0) {
    if (skip + this.index < this.input.length) return this.input[this.index + skip]
    return null
  }
  addToken(token) { this.tokens.push(newLexicalToken({...token, block: this.block})) }

  ////////////////////
  //                //
  //  TEST METHODS  //
  //                //
  ////////////////////
  
  isMuteOperator(c) { return this.tokens.length === 0 && /[~]/.test(c)}  // must be the first character
  isSoloOperator(c) { return this.tokens.length === 0 && /[$]/.test(c)}  // must be the first character
  isWhiteSpace(c)   { return /\s/.test(c) }
  isBracket(c)      { return /[[\](){}]/.test(c) }
  isSeparator(c)    { return /[,:]/.test(c) }
  isQuote(c)        { return /['"]/.test(c) }
  isRest(c)         { return /[-]/.test(c)}
  isOperator(c)     { return /[|.=*]/.test(c) }
  isComment(c)      { return /[#]/.test(c) }
  isDigit(c)        { return /[0-9]/.test(c) }
  isHzUnit(c0, c1)  { return c0 && c0.toLowerCase() === 'h' && c1 && c1.toLowerCase() === 'z'}
  // since identifiers can have digits in the name, we don't check for non-digitness
  isIdentifier(c) {
    return typeof c === 'string'
      && !this.isWhiteSpace(c)
      && !this.isSeparator(c)
      && !this.isBracket(c)
      && !this.isQuote(c)
      && !this.isOperator(c)
  }
}
