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

    
    // set inputs and outputs
    this.input  = this.audioContext.createGain()
    this.output = this.audioContext.createGain()

    this.delay    = this.audioContext.createDelay()
    this.feedback = this.audioContext.createGain()
    this.wetLevel = this.audioContext.createGain()

    // delay settings
    this.delay.delayTime.value = 0.15  // 150 ms delay
    this.feedback.gain.value   = 0.85
    this.wetLevel.gain.value   = 0.95

    // wire it up
    this.input.connect(this.delay)
    this.input.connect(this.output)
    this.delay.connect(this.feedback)
    this.delay.connect(this.wetLevel)
    this.feedback.connect(this.delay)
    this.wetLevel.connect(this.output)
  }

  update() {
    // do something depending on parameters
  }
}
