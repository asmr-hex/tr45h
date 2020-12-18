import { Subject } from 'rxjs'

// read about memory systems here: https://ruslanspivak.com/lsbasi-part17/


export class MemorySystem {
  constructor() {
    this._blocks = {}

    this.changes = Subject()
  }

  get(key) {
    return key in this._blocks ? this._blocks[key] : null
  }

  set(key, stmt) {
    this._blocks[key] = stmt

    // update rxjs changes
    this.changes.next({type: 'SET', key})
  }
  
  delete(key) {
    delete this._blocks[key]

    // update rxjs changes
    this.changes.next({type: 'DELETE', key})
  }
}
