import { AudioProcessor } from './audioProcessor'

// contract between this class and the symbols parameters class
// TODO might not even need this...too much indirection..... YAGNI
class Parameters {
  constructor({level, level_fn}) {
    this.level    = level
    this.level_fn = level_fn
    
  }
}

export class VolumeProcessor extends AudioProcessor {
  constructor(audioContext, args) {
    this.super(audioContext)

    // process parameters
    this.parameters = new Parameters(args)

    // create gain node
    this.gainNode = this.audioContext.createGain()

    // set inputs and outputs
    this.input  = this.gainNode
    this.output = this.gainNode
  }

  update() {
    // do something depending on parameters
  }
}
