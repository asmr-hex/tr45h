import { AudioProcessor } from './audioProcessor'

// contract between this class and the symbols parameters class
// TODO might not even need this...too much indirection..... YAGNI
class Parameters {
  constructor({time, time_fn}) {
    this.time    = time
    this.time_fn = time_fn
    
  }
}

export class ReverbProcessor extends AudioProcessor {
  constructor(audioContext, args) {
    super(audioContext)

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
