import { Subject } from 'rxjs'
import randomColor from 'randomcolor'

// read about memory systems here: https://ruslanspivak.com/lsbasi-part17/


export class MemorySystem {
  constructor() {
    this._blocks = {}
    this._meta   = {}

    this.changes = new Subject()
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

    if (key in this._meta) delete this._meta[key]
    
    // update rxjs changes
    this.changes.next({type: 'DELETE', key})
  }

  getMetaData(key) {
    return key in this._meta
      ? this._meta[key]
      : this.setMetaData(key)
  }

  setMetaData(key) {
    return this._meta[key] = {
      color: randomColor({ luminosity: 'light' })
    }
  }
}
