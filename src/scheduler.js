import { reduce, filter, values, keys, intersection, xor } from 'lodash'
import Recorder from 'recorder-js'


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
  constructor(audioContext, setCurrentStep, setAnalyzerData, bpm = 128) {
    this.audioContext = audioContext
    this.setCurrentStep = setCurrentStep
    this.bpm = bpm
    this.tmpBpm = bpm
    this.sequences = {}
    this.lookAheadInterval = 100 // ms
    this.timerFn = null
    this.soundMap = {}

    // recording
    this.setAnalyzerData = setAnalyzerData
    this.mediaStreamDestination = this.audioContext.createMediaStreamDestination()
    this.mediaRecorder = new Recorder(this.audioContext, {
      onAnalysed: data => {
        this.setAnalyzerData(data)
      }
    })
    this.mediaRecorder.init(this.mediaStreamDestination.stream)
    this.isRecording = false

    this.filename = 'untitled'
  }

  async setSoundMap(soundMap) {
    // we will create AudioBuffers for each Array Buffer so we dont have
    // to do it at schedule time!
    // soundMap = { 'sound name': {buffer: ArrayBuffer<>, status: 'idk' } }
    // this.soundMap = {'sound name': AudioBuffer<>}

    // remove sounds which exist in this.soundMap but not in soundMap
    const rmSoundWords = intersection(xor(keys(this.soundMap), keys(soundMap)), keys(this.soundMap))
    for (const rmSoundWord of rmSoundWords) {
      delete this.soundMap[rmSoundWord]
    }
    
    // incrementally update the sound map (add new sounds)
    for (const [soundWord, sound] of Object.entries(soundMap)) {
      // if the buffer is null, don't add it (it is probably still searching/loading)
      if (!sound.buffer) continue

      // if the sound word exists already, do nothing
      if (this.soundMap[soundWord]) continue
      
      this.soundMap[soundWord] = await this.audioContext.decodeAudioData(sound.buffer.slice(0), () => {})
    }
    
    for (const key of Object.keys(this.sequences)) {
      this.sequences[key].setSoundMap(this.soundMap)
    }
  }

  setBpm(bpm) {
    this.tmpBpm = bpm
  }
  
  setSequences(sequences) {
    // reset filename to two random words in the sequences
    const words = filter(reduce(sequences, (acc, v, k) => [...acc, ...v], []), v => v !== '_')
    this.filename = `${words[Math.floor(Math.random() * words.length)]} ${words[Math.floor(Math.random() * words.length)]}`
    
    for (const [key, sequence] of Object.entries(sequences)) {
      if (key in this.sequences) {
        this.sequences[key].setSequence(sequence)
      } else {
        this.sequences[key] = new Sequence(
          sequence,
          this.audioContext,
          this.mediaStreamDestination,
          step => this.setCurrentStep(key, step),
          this.bpm,
        )
      }
    }
  }

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
      Recorder.download(blob, this.filename)
    })
  }
  
  start() {
    this.timerFn = setInterval(() => {
      // if Web Audio has been suspended (see https://goo.gl/7K7WLu), resume
      if (this.audioContext.state === "suspended") this.audioContext.resume()

      for (const sequence of values(this.sequences)) {
        sequence.setBpm(this.tmpBpm)
        sequence.schedule()
      }
      this.bpm = this.tmpBpm
      
    }, this.lookAheadInterval)
  }
}


class Sequence {
  constructor(sequence, audioContext, mediaStreamDestination, setCurrentStep, bpm = 128) {
    this.audioContext = audioContext
    this.mediaStreamDestination = mediaStreamDestination
    this.setCurrentStep = setCurrentStep
    this.bpm = bpm                   // beats per minute (default 128)
    this.nextNoteTime = 0.0          // when to schedule the next note
    this.scheduleAheadTime = 0.1     // how far ahead to shcedule notes (seconds)
    this.noteLength = 0.5           // duration of note (seconds)
    
    this.soundMap = {}
    this.sequence = sequence
    this.currentStep = 0

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
    const audioBuffer = this.soundMap[this.sequence[this.currentStep]]

    // set current step for outside world to see
    this.setCurrentStep(this.currentStep)
    
    // ignore steps with no sounds (maybe still loading)
    if (!audioBuffer) return

    sample.buffer = audioBuffer
    sample.connect(this.delay)
    // sample.connect(this.audioContext.destination)
    // sample.connect(this.mediaStreamDestination)
    sample.start(time)
    sample.stop(time + this.noteLength)
  }

  nextNote() {
    // console.log(this.sequence[this.currentStep])
    const ppqn = 1 // TODO change this when we want to change tempos // IF WE USE PARSED SEQUENCES WE NEED TO BE USING THE PPQN FROM THE PREVIOUS STEP
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
