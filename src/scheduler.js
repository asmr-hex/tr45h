import { values } from 'lodash'

class Sequence {
  constructor(sequence, audioContext, bpm = 128) {
    this.audioContext = audioContext
    this.bpm = bpm                   // beats per minute (default 128)
    this.nextNoteTime = 0.0          // when to schedule the next note
    this.scheduleAheadTime = 0.1     // how far ahead to shcedule notes (seconds)
    this.noteLength = 0.5           // duration of note (seconds)
    
    this.soundMap = {}
    this.sequence = sequence
    this.currentStep = 0
  }

  setBpm(bpm) { this.bpm = bpm }
  setSoundMap(soundMap) { this.soundMap = soundMap }
  setSequence(sequence) {
    this.sequence = sequence
    this.currentStep = (this.currentStep % sequence.length + sequence.length) % sequence.length
  }
  
  async scheduleNote(time) {
    const sample = this.audioContext.createBufferSource()
    const arrayBuffer = this.soundMap[this.sequence[this.currentStep]].buffer
    
    // ignore steps with no sounds (maybe still loading)
    if (!arrayBuffer) return

    sample.buffer = await this.audioContext.decodeAudioData(arrayBuffer.slice(0))
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


export class Scheduler {
  constructor(audioContext, bpm = 128) {
    this.audioContext = audioContext
    this.bpm = bpm
    this.sequences = {}
    this.lookAheadInterval = 100 // ms
    this.timerFn = null
  }

  setSoundMap(soundMap) {
    for (const key of Object.keys(this.sequences)) {
      this.sequences[key].setSoundMap(soundMap)
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
        this.sequences[key] = new Sequence(sequence, this.audioContext, this.bpm)
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
