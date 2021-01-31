
export class BlockAnnotation {
  constructor(tokens) {
    this.index = tokens
  }

  get(offset) {
    for (let i = this.index.length - 1; i >= 0; i--) {
      if (offset >= this.index[i].start) {
        if (offset <= (this.index[i].start + this.index[i].length)) return this.index[i]
        return null
      }
    }

    return null
  }
}

export class Annotator {
  constructor({ symbols, setAnnotation }) {
    this.index = {}
    this.sym = symbols

    this.setAnnotation = setAnnotation

    this.previousTokenId = null
    this.subscription = null
  }

  update(block, parsedText) {
    this.index[block] = new BlockAnnotation(parsedText.tokens)
    return parsedText
  }

  check(selection) {
    if (!selection.isCollapsed()) return

    // check if selection is correct

    const block  = selection.getAnchorKey()
    const offset = selection.getAnchorOffset()

    if (!(block in this.index)) return
    
    const token = this.index[block].get(offset)

    if (!token) {
      this.unsubscribe()
      return
    }
    else if (token.id === this.previousTokenId) {
      return
    }

    this.previousTokenId = token.id

    // get symbol observable from symbol table and subscribe to it
    const observable = this.sym.getObservable(token)
    if (observable === null) {
      this.unsubscribe()
      return
    }
    if (this.subscription !== null) this.subscription.unsubscribe()
    this.subscription = observable.updates.subscribe(sym => this.setAnnotation({token, symbol: sym}))

    // actually update
    // use token Instance and symbol observable as value in setAnnotation
    // e.g. { instance: token, symbol: observable }
    this.setAnnotation({token, symbol: observable.symbol})
  }

  unsubscribe() {
    this.setAnnotation(null)
    if (this.subscription !== null) this.subscription.unsubscribe()
    this.previousTokenId = null    
  }
}
