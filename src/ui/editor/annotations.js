
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

    // TODO also, for efficiency, check if this token is the same as the previous.
    // e.g. keep internal state about previous token.
    
    if (!token) return

    // TODO get symbol observable from symbol table
    // TODO use token Instance and symbol observable as value in setCurrentAnnotation
    // e.g. { instance: token, symbol: observable }
    const annotation = {
      token,
      symbol: this.sym.getObservable(token)
    }
    
    this.setCurrentAnnotation(annotation)
    // console.log(annotation)
  }
}
