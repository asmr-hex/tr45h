import { FirstPassParser } from './firstPass'
import { SecondPassParser } from './secondPass'


export class Parser {
  constructor({ symbols, audioContext }) {
    this.firstPassParser  = new FirstPassParser(symbols)
    this.secondPassParser = new SecondPassParser(symbols, audioContext)
  }

  firstPass(tokens, blockKey, blockIndex) {
    return this.firstPassParser.analyze(tokens, blockKey, blockIndex)
  }

  secondPass(tokens, blockKey, blockIndex) {
    const { ast } = this.secondPassParser.analyze(tokens, blockKey, blockIndex)
    return ast
  }
}
