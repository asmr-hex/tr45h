import { AudioProcessor } from './audioProcessor'

// contract between this class and the symbols parameters class
class Parameters {
  constructor({level, level_fn}) {
    this.level    = level
    this.level_fn = level_fn
    
  }
}

export class VolumeProcessor extends AudioProcessor {
  constructor(audioContext, parameters) {
    this.super(audioContext)

    // process parameters
    this.parameters = new Parameters(parameters)

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
