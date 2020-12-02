import { reduce, filter, values, keys, intersection, xor } from 'lodash'
import Recorder from 'recorder-js'

import { audioContext } from './context/audio'


/**
 * Responsible for scheduling all audio events for this instrument.
 *
 *
 */
export class Scheduler {
  constructor(ast, symbolTable, transport, theme) {
    this.theme = theme

    this.audioContext = audioContext
    this.volume = this.audioContext.createGain()
    this.volume.connect(this.audioContext.destination)
    this.output = this.volume
    
    
    ////////////////////
    //                //
    // playback state //
    //                //
    ////////////////////

    this.transport = transport
    this.isPlaying   = true
    this.isPaused    = false
    this.isRecording = false
    this.bpm         = { current: 128, next: 128 }
    
    // subscribe to transport updates
    transport.isPlaying.subscribe(isPlaying => {
      this.isPlaying = isPlaying
      if (this.isPlaying) { this.start(); return }                   // if now playing, start and return
      if (this.isRecording) this.stopRecording()                     // if not playing & recording, stop recording
      this.stop()                                                    // if not playing, stop
    })
    transport.isPaused.subscribe(isPaused => {
      this.isPaused = isPaused
      if (!this.isPaused && this.isPlaying) { this.start(); return } // if not paused, but playing, start and return
      if (this.isRecording) this.stopRecording()                     // if now paused & recording, stop recording
      this.pause()                                                   // if now paused, pause
    })
    transport.isRecording.subscribe(isRecording => {
      // note: recording state is set internally by start/stopRecording
      if (isRecording && !this.isPlaying) this.start()               // if now recording & not playing, start
      if (isRecording) { this.startRecording(); return }             // if now recording, start recording and return
      this.stopRecording()                                           // if not recording, stop recording
    })
    transport.isMuted.subscribe(isMuted => {
      this.toggleMute(isMuted)
    })
    transport.bpm.subscribe(bpm => {
      this.bpm.next = bpm                                            // set the next bpm
    })
    

    

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

  updateTheme(theme) {
    this.theme = theme
    for (const sequence of this.sequences) {
      sequence.updateTheme(theme)
    }
  }
  
  setAST(ast) {
    this.ast = ast
    this.sequences = this.ast.map(
      s => new Sequence(s, this.symbolTable, this.audioContext, this.output, this.mediaStreamDestination, this.theme, this.transport, this.bpm.next)
    )
  }
  setSymbols(symbols) { this.symbolTable = symbols }
  

  setBpm(bpm) {
    this.tmpBpm = bpm
  }

  toggleMute(isMuted) {
    this.volume.gain.value = isMuted ? 0 : 1
  }
  
  stop() {
    clearInterval(this.timerFn)
    this.timerFn = null
    for (const sequence of values(this.sequences)) {
      sequence.resetReadHead()
    }
    this.audioContext.suspend()
  }

  pause() {
    clearInterval(this.timerFn)
    this.timerFn = null
    this.audioContext.suspend()
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
    // make sure we aren't starting up multiple intervals
    if (this.timerFn !== null) return
    
    this.timerFn = setInterval(() => {
      // if Web Audio has been suspended (see https://goo.gl/7K7WLu), resume
      if (this.audioContext.state === "suspended") this.audioContext.resume()

      // console.log(this.ast)
      
      for (const sequence of this.sequences) {
        sequence.schedule()
      }
      this.bpm.current = this.bpm.next
      
    }, this.lookAheadInterval)
  }
}


class Sequence {
  constructor(ast, symbolTable, audioContext, output, mediaStreamDestination, theme, transport, bpm = 128) {
    this.ast = ast
    this.symbolTable = symbolTable

    this.theme = theme

    this.isPaused = false
    transport.isPaused.subscribe(v => {
      this.isPaused = v
      if (this.isPaused) return
      // if unpaused, remove all underlines now
      if (!this.ast || !this.ast.current()) return
      const stepElements = document.getElementsByClassName(this.ast.current().id)
      for (const el of stepElements) {
        el.classList.remove(this.theme.classes.currentStep)
      }
    })
    
    this.audioContext = audioContext
    this.mediaStreamDestination = mediaStreamDestination
    
    this.bpm = bpm                   // beats per minute (default 128)
    this.scheduleAheadTime = 0.1     // how far ahead to shcedule notes (seconds)
    this.noteLength = 0.5           // duration of note (seconds)
    this.nextNoteTime = 0.0
    

    // experimental effects
    this.delay = audioContext.createDelay()
    this.delay.connect(output)
    this.delay.connect(this.mediaStreamDestination)
    
  }

  updateTheme(theme) {
    this.theme = theme
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
    // this.setCurrentStep(0)
  }
  
  async scheduleNote(time) {
    const sample = this.audioContext.createBufferSource()

    const symbol = this.symbolTable.get(this.ast.current().value)
    if (!symbol) return // in case this symbol has been removed from the symbol table
    const audioBuffer = symbol.value
    
    // ignore steps with no sounds (maybe still loading)
    if (!audioBuffer) return

    // calculate endTime
    const endTime = time + (1/this.ast.current().ppqn) * (60.0 / this.bpm) //time + this.noteLength) TODO MAKE ENVELOPE CONFIGURATBLE
    
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
        el.classList.add(this.theme.classes.currentStep)
      }
    }, (time - this.audioContext.currentTime) * 1000)
    setTimeout(() => {
      if (this.isPaused) return // do not remove the underline if paused
      for (const el of stepElements) {
        el.classList.remove(this.theme.classes.currentStep)
      }
    }, (endTime - this.audioContext.currentTime) * 1000) 
    
    // console.log({bpm: this.bpm, ppqn: this.ast.current().ppqn, sound: this.ast.current().value})
  }

  nextNote() {    
    this.nextNoteTime += (1/this.ast.current().ppqn) * (60.0 / this.bpm) // add seconds / beat (scaled by ppqn)
    this.ast.advance()
  }

  async schedule() {
    if (!this.ast) return // in case the ast is null
    
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      await this.scheduleNote(this.nextNoteTime)
      this.nextNote()
    }
  }
}
