import { reduce, filter, values, keys, intersection, xor } from 'lodash'
import Recorder from 'recorder-js'

import { audioContext } from './context/audio'


/**
 * Notes about supporting new language features
 * ultimately what the scheduler wants when it is scheduling sounds is an array of sound-phrases to
 * play for each sequence and an array of sequences to schedule.
 * since individual sound-phrases and also sequences can be:
 *  (1) bound to variables
 *  (2) have processing operators applied
 * we need to have a way to simply resolve all sounds and processing chains at schedule time
 * so, the resolution process, from the point of view from the scheduler will resemble:
 *  (1) collect all sequences being evaluated
 *  (2) collect all sound-phrases being evaluated in each sequence
 * all sequences must eventually resolve to Array<SOUND_LITERAL>, where a SOUND_LITERAL has a buffer
 * since non-resolved sequences can be composed of 
 */

export class Scheduler {
  constructor(ast, symbolTable, bpm = 128) {
    this.audioContext = audioContext
    this.bpm = bpm
    this.tmpBpm = bpm
    
    this.ast = ast
    this.symbolTable = symbolTable
    this.sequences = []
    
    this.lookAheadInterval = 100 // ms
    this.timerFn = null

    // recording
    this.mediaStreamDestination = this.audioContext.createMediaStreamDestination()
    this.mediaRecorder = new Recorder(this.audioContext)
    this.mediaRecorder.init(this.mediaStreamDestination.stream)
    this.isRecording = false

    this.filename = 'untitled'
  }

  setAST(ast) {
    this.ast = ast
    this.sequences = this.ast.map(
      s => new Sequence(s, this.symbolTable, this.audioContext, this.mediaStreamDestination, this.tmpBpm)
    )
  }
  setSymbols(symbols) { this.symbolTable = symbols }
  
  // async setSoundMap(soundMap) {
  //   // we will create AudioBuffers for each Array Buffer so we dont have
  //   // to do it at schedule time!
  //   // soundMap = { 'sound name': {buffer: ArrayBuffer<>, status: 'idk' } }
  //   // this.soundMap = {'sound name': AudioBuffer<>}

  //   // remove sounds which exist in this.soundMap but not in soundMap
  //   const rmSoundWords = intersection(xor(keys(this.soundMap), keys(soundMap)), keys(this.soundMap))
  //   for (const rmSoundWord of rmSoundWords) {
  //     delete this.soundMap[rmSoundWord]
  //   }
    
  //   // incrementally update the sound map (add new sounds)
  //   for (const [soundWord, sound] of Object.entries(soundMap)) {
  //     // if the buffer is null, don't add it (it is probably still searching/loading)
  //     if (!sound.buffer) continue

  //     // if the sound word exists already, do nothing
  //     if (this.soundMap[soundWord]) continue
      
  //     this.soundMap[soundWord] = await this.audioContext.decodeAudioData(sound.buffer.slice(0), () => {})
  //   }
    
  //   for (const key of Object.keys(this.sequences)) {
  //     this.sequences[key].setSoundMap(this.soundMap)
  //   }
  // }

  setBpm(bpm) {
    this.tmpBpm = bpm
  }
  
  // setSequences(sequences) {
  //   // reset filename to two random words in the sequences
  //   const words = filter(reduce(sequences, (acc, v, k) => [...acc, ...v], []), v => v !== '_')
  //   this.filename = `${words[Math.floor(Math.random() * words.length)]} ${words[Math.floor(Math.random() * words.length)]}`
    
  //   for (const [key, sequence] of Object.entries(sequences)) {
  //     if (key in this.sequences) {
  //       this.sequences[key].setSequence(sequence)
  //     } else {
  //       this.sequences[key] = new Sequence(
  //         sequence,
  //         this.audioContext,
  //         this.mediaStreamDestination,
  //         step => this.setCurrentStep(key, step),
  //         this.bpm,
  //       )
  //     }
  //   }
  // }

  stop() {
    clearInterval(this.timerFn)
    this.timerFn = null
    for (const sequence of values(this.sequences)) {
      sequence.resetReadHead()
    }
  }

  pause() {
    clearInterval(this.timerFn)
    this.timerFn = null    
  }
  
  startRecording() {
    if (this.isRecording) return
    this.mediaRecorder.start().then(() => this.isRecording = true)
  }

  stopRecording() {
    if (!this.isRecording) return
    this.mediaRecorder.stop().then(({blob, buffer}) => {
      this.isRecording = false
      // TODO set filename to random words in symbol table
      // const words = filter(reduce(sequences, (acc, v, k) => [...acc, ...v], []), v => v !== '_')
      // this.filename = `${words[Math.floor(Math.random() * words.length)]} ${words[Math.floor(Math.random() * words.length)]}`
      
      Recorder.download(blob, this.filename)
    })
  }
  
  start() {
    this.timerFn = setInterval(() => {
      // if Web Audio has been suspended (see https://goo.gl/7K7WLu), resume
      if (this.audioContext.state === "suspended") this.audioContext.resume()

      // console.log(this.ast)
      
      for (const sequence of this.sequences) {
        sequence.schedule()
      }
      this.bpm = this.tmpBpm
      
    }, this.lookAheadInterval)
  }
}


class Sequence {
  constructor(ast, symbolTable, audioContext, mediaStreamDestination, bpm = 128) {
    this.ast = ast
    this.symbolTable = symbolTable
    
    this.audioContext = audioContext
    this.mediaStreamDestination = mediaStreamDestination
    
    this.bpm = bpm                   // beats per minute (default 128)
    this.scheduleAheadTime = 0.1     // how far ahead to shcedule notes (seconds)
    this.noteLength = 0.5           // duration of note (seconds)
    this.nextNoteTime = 0.0
    

    // experimental effects
    this.delay = audioContext.createDelay()
    this.delay.connect(this.audioContext.destination)
    this.delay.connect(this.mediaStreamDestination)
    
  }

  setBpm(bpm) { this.bpm = bpm }
  setSoundMap(soundMap) {
    this.soundMap = soundMap
  }
  setSequence(sequence) {
    this.sequence = sequence
    this.currentStep = (this.currentStep % sequence.length + sequence.length) % sequence.length
  }
  resetReadHead() {
    this.setCurrentStep(0)
  }
  
  async scheduleNote(time) {
    const sample = this.audioContext.createBufferSource()
    const audioBuffer = this.symbolTable.get(this.ast.current().value).value
    
    // ignore steps with no sounds (maybe still loading)
    if (!audioBuffer) return

    // calculate endTime
    const endTime = time + (1/this.ast.next().ppqn) * (60.0 / this.bpm) //time + this.noteLength) TODO MAKE ENVELOPE CONFIGURATBLE
    
    sample.buffer = audioBuffer
    sample.connect(this.delay)
    // sample.connect(this.audioContext.destination)
    // sample.connect(this.mediaStreamDestination)
    sample.start(time)
    sample.stop(endTime)

    // schedule UI step event for this
    // TODO this is like a hack kinda.....but maybe its fine!
    // anyway, i want to make this a little more elegant
    const stepElements = document.getElementsByClassName(this.ast.current().id)
    setTimeout(() => {
      for (const el of stepElements) {
        el.style.borderBottom = '5px solid white'
      }
    }, (time - this.audioContext.currentTime) * 1000)
    setTimeout(() => {
      for (const el of stepElements) {
        el.style.borderBottom = 'none'
      }
    }, (endTime - this.audioContext.currentTime) * 1000) 
    
    // console.log({bpm: this.bpm, ppqn: this.ast.current().ppqn, sound: this.ast.current().value})
  }

  nextNote() {
    
    // console.log(this.sequence[this.currentStep])
    this.nextNoteTime += (1/this.ast.current().ppqn) * (60.0 / this.bpm) // add seconds / beat (scaled by ppqn)
    this.ast.advance()
    //this.currentStep = ( (this.currentStep + 1 ) % this.sequence.length + this.sequence.length) % this.sequence.length

  }

  async schedule() {
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      await this.scheduleNote(this.nextNoteTime)
      this.nextNote()
    }
  }
}
