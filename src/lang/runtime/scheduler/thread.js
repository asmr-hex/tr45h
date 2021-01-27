

export class Thread {
  constructor(seq, sym, context, theme) {
    this.seq = seq                   // executing sequence.
    this.sym = sym                   // symbol table.
    
    this.audio = {
      context,                       // WebAudio Context instance.
      output: context.createGain(),  // GainNode as Thread output.
    }

    this.bpm               = null    // beats / s. set when run() is called.
    this.nextStepTime      = 0.0     // (s) time until next step.
    this.scheduleAheadTime = 0.1     // (s) how ahead of time we schedule steps.

    this.theme = null                // style themes.
    theme.subscribe(t => { this.theme = t })

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
    const step = this.seq.current()
    const eTime = sTime + (1/step.ppqn) * (60.0 / this.bpm) //time + this.noteLength) TODO MAKE ENVELOPE CONFIGURATBLE
    
    const sample = this.audio.context.createBufferSource()
    const sound  = this.sym.getSound(step.id)

    this.markVisualStep(step.instance, sTime, eTime)
    
    if (!sound)        return
    if (!sound.buffer) return
    
    sample.buffer = sound.buffer

    // either connect to processor chain or normal output
    if (step.fx) {
      sample.connect(step.fx.input)
      step.fx.connect(this.audio.output)
    } else {
      sample.connect(this.audio.output) 
    }

    sample.start(sTime)
    sample.stop(eTime)

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
