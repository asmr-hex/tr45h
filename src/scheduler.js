import { values } from 'lodash'


export class Scheduler {
  constructor(audioContext, setCurrentStep, bpm = 128) {
    this.audioContext = audioContext
    this.setCurrentStep = setCurrentStep
    this.bpm = bpm
    this.sequences = {}
    this.lookAheadInterval = 100 // ms
    this.timerFn = null
  }

  async setSoundMap(soundMap) {
    // we will create AudioBuffers for each Array Buffer so we dont have
    // to do it at schedule time!
    // soundMap = { 'sound name': {buffer: ArrayBuffer<>, status: 'idk' } }
    // this.soundMap = {'sound name': AudioBuffer<>}
    this.soundMap = {}
    for (const [soundWord, sound] of Object.entries(soundMap)) {
      if (!sound.buffer) continue
      this.soundMap[soundWord] = await this.audioContext.decodeAudioData(sound.buffer.slice(0))
    }
    
    for (const key of Object.keys(this.sequences)) {
      this.sequences[key].setSoundMap(this.soundMap)
    }
  }

  setBpm(bpm) {
    for (const key of Object.keys(this.sequences)) {
      this.sequences[key].setBpm(bpm)
    }
  }
  
  setSequences(sequences) {
    for (const [key, sequence] of Object.entries(sequences)) {
      if (key in this.sequences) {
        this.sequences[key].setSequence(sequence)
      } else {
        this.sequences[key] = new Sequence(
          sequence,
          this.audioContext,
          step => this.setCurrentStep(key, step),
          this.bpm)
      }
    }
  }

  stop() {
    clearInterval(this.timerFn)
    this.timerFn = null
  }
  
  start() {
    this.timerFn = setInterval(() => {
      // if Web Audio has been suspended (see https://goo.gl/7K7WLu), resume
      if (this.audioContext.state === "suspended") this.audioContext.resume()
      
      for (const sequence of values(this.sequences)) {
        sequence.schedule()
      }
    }, this.lookAheadInterval)
  }
}


class Sequence {
  constructor(sequence, audioContext, setCurrentStep, bpm = 128) {
    this.audioContext = audioContext
    this.setCurrentStep = setCurrentStep
    this.bpm = bpm                   // beats per minute (default 128)
    this.nextNoteTime = 0.0          // when to schedule the next note
    this.scheduleAheadTime = 0.1     // how far ahead to shcedule notes (seconds)
    this.noteLength = 0.5           // duration of note (seconds)
    
    this.soundMap = {}
    this.sequence = sequence
    this.currentStep = 0
  }

  setBpm(bpm) { this.bpm = bpm }
  setSoundMap(soundMap) {
    this.soundMap = soundMap
  }
  setSequence(sequence) {
    this.sequence = sequence
    this.currentStep = (this.currentStep % sequence.length + sequence.length) % sequence.length
  }
  
  async scheduleNote(time) {
    const sample = this.audioContext.createBufferSource()
    const audioBuffer = this.soundMap[this.sequence[this.currentStep]]

    // set current step for outside world to see
    this.setCurrentStep(this.currentStep)
    
    // ignore steps with no sounds (maybe still loading)
    if (!audioBuffer) return

    sample.buffer = audioBuffer
    sample.connect(this.audioContext.destination)
    sample.start(time)
    sample.stop(time + this.noteLength)
  }

  nextNote() {
    // console.log(this.sequence[this.currentStep])
    const ppqn = 1 // TODO change this when we want to change tempos
    this.nextNoteTime += (1/ppqn) * (60.0 / this.bpm) // add seconds / beat (scaled by ppqn)
    this.currentStep = ( (this.currentStep + 1 ) % this.sequence.length + this.sequence.length) % this.sequence.length
  }
  
  async schedule() {
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      await this.scheduleNote(this.nextNoteTime)
      this.nextNote()
    }
  }
}
