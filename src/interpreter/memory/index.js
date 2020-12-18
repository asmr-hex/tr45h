

// read about memory systems here: https://ruslanspivak.com/lsbasi-part17/


export class MemorySystem {
  constructor() {
    this._blocks = {}

    this.changes = null // TODO an rxjs event stream for changes to ast.
  }

  delete(key) {}
  merge(stmt) {}
}
