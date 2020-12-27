
export class BlockAnnotation {
  constructor(tokens) {
    this.index = tokens
  }

  get(offset) {
    for (let i = 0; i < this.index.length; i++) {
      if (offset >= this.index[i].start) {
        if (offset <= (this.index[i].start + this.index[i].length)) return this.index[i]
        return null
      }
    }

    return null
  }
}

export class Annotator {
  constructor(setCurrentAnnotation, sym) {
    this.index = {}
    this.setCurrentAnnotation = setCurrentAnnotation
    this.sym = sym

    this.previousTokenId = null
  }

  register(block, tokens) {
    this.index[block] = new BlockAnnotation(tokens)
  }

  check(selection) {
    if (!selection.isCollapsed()) return

    // check if selection is correct

    const block  = selection.getAnchorKey()
    const offset = selection.getAnchorOffset()

    if (!(block in this.index)) return
    
    const token = this.index[block].get(offset)

    if (!token) {
      this.setCurrentAnnotation(null)
      this.previousTokenId = null
      return
    }
    else if (token.id === this.previousTokenId) {
      return
    }

    this.previousTokenId = token.id

    // get symbol observable from symbol table
    // use token Instance and symbol observable as value in setCurrentAnnotation
    // e.g. { instance: token, symbol: observable }
    const annotation = {
      token,
      symbol: this.sym.getObservable(token)
    }
    
    this.setCurrentAnnotation(annotation)
  }
}
