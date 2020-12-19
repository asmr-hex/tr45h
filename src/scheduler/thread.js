

export class Thread {
  constructor(seq, sym, context) {
    this.seq = seq                   // executing sequence.
    this.sym = sym                   // symbol table.
    
    this.audio = {
      context,                       // WebAudio Context instance.
      output: context.createGain(),  // GainNode as Thread output.
    }

    this.theme = null                // TODO deal with this.

    this.bpm               = null    // beats / s. set when run() is called.
    this.nextStepTime      = 0.0     // (s) time until next step.
    this.scheduleAheadTime = 0.1     // (s) how ahead of time we schedule steps.
  }

  async run(bpm) {
    if (!this.seq) return
    
    this.bpm = bpm  // set the bpm here.

    while (this.nextStepTime < this.audio.context.currentTime + this.scheduleAheadTime) {
      await this.schedule(this.nextStepTime)
      this.advance()
    }
  }

  advance() {
    this.nextStepTime += (1/this.seq.current().ppqn) * (60.0 / this.bpm)  // increment by seconds/beat (scaled by ppqn)
    this.seq.advance()
  }

  async schedule(sTime) {
    const eTime = sTime + (1/this.seq.current().ppqn) * (60.0 / this.bpm) //time + this.noteLength) TODO MAKE ENVELOPE CONFIGURATBLE
    
    const sample = this.audio.context.createBufferSource()
    const sound  = this.sym.getSound(this.seq.current().id)
    
    if (!sound)        return
    if (!sound.buffer) return
    
    sample.buffer = sound.buffer
    sample.connect(this.audio.output)

    sample.start(sTime)
    sample.stop(eTime)

    this.markVisualStep(this.seq.current().instance, sTime, eTime)
  }

  markVisualStep(instance, start, end) {
    const steps = document.getElementsByClassName(instance)

    setTimeout(() => {
      for (const s of steps) { s.classList.add(this.theme.classes.currentStep) }
    }, (start - this.audio.context.currentTime) * 1000)
    
    setTimeout(() => {
      if (this.isPaused) return // do not remove the underline if paused
      for (const s of steps) { s.classList.remove(this.theme.classes.currentStep) }
    }, (end - this.audio.context.currentTime) * 1000)
    
  }
  
  kill() {
    this.audio.output.disconnect()
  }
}
