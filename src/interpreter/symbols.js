import { filter, flatMap, uniq, reduce, keys, values, intersection, xor } from 'lodash'

import { audioContext } from '../context/audio'
import { getNativeSymbols } from './nativeSymbols'


const API_TOKEN = "aMdevlgMb06KIjs2yy4pkFbw9IOwq5Z6cZFWncsj"

// soundwords
// fx
// symbols are entires of identifiers as keys
// with an object as a value with different fields
// {
//   'apple': {
//     type: 'sound',
//     status: 'downloading',
//     value: <bytes>,
//     meta: {...}
//   },
//   'reverb': {
//     type: 'fx',
//     status: 'ready',
//     value: <fn>,
//     meta: {...},
//   }
// }
export class SymbolTable {
  constructor(theme) {
    this.theme = theme
    this.symbols = getNativeSymbols()
    this.activeIdentifiersByBlock = {}
    this.fetchWaitInterval = 1000  // in ms
  }

  updateTheme(theme) {
    this.theme = theme
  }
  
  /**
   * updates by-block record of active identifiers and prunes dangling identifiers.
   *
   * @param {string} blockKey the key of the block being updated
   * @param {LexicalAnalysisResults} lexicon the results of lexical analysis.
   */
  updateActiveIdentifiers(blockKey, lexicon) {
    this.activeIdentifiersByBlock[blockKey] = uniq([
      ...lexicon.tokens.filter(t => t.type === 'IDENTIFIER').map(t => t.value),
      ...flatMap(lexicon.errors, e => e.tokens).filter(t => t.type === 'IDENTIFIER').map(t => t.value)
    ])

    const allActiveIdentifiers = uniq(flatMap(values(this.activeIdentifiersByBlock)))
    const identifiersInSymbolTable = keys(this.symbols)

    const danglingIdentifiers = intersection(xor(identifiersInSymbolTable, allActiveIdentifiers), identifiersInSymbolTable)

    // remove dangling identifiers
    for (const danglingIdentifier of danglingIdentifiers) {
      this.remove(danglingIdentifier)
    }
  }
  
  // {
  //   identifier: <identifier>,
  //   type: <type>,
  //   status: <status>,
  //   value: <value>
  //   meta: <metadata>
  // }
  merge(symbol) {
    
    
    // is this a new symbol?
    const exists = symbol.identifier in this.symbols
          
    // get existing or default fields
    const fields = exists
          ? this.symbols[symbol.identifier]
          : { type: null, status: null, value: null, meta: null}

    // merge symbol
    this.symbols[symbol.identifier] = {
      ...fields,
      ...symbol,
    }

    if (!exists && symbol.type && symbol.type === 'sound')
      // this identifier is a new sound, we need to resolve it
      setTimeout(() => this._fetchNewSound(symbol), this.fetchWaitInterval)
  }

  get(identifier) {
    return identifier in this.symbols
      ? this.symbols[identifier]
      : null
  }
  
  remove(identifier) {
    if (this.symbols[identifier].status !== 'static')
      delete this.symbols[identifier]
  }

  /**
   * returns true if this is a valid query parameter for a sound
   */
  isQueryParameter(token) {
    return token in this.symbols['_soundFn'].meta.parameters
  }
  
  // metadata for sounds
  // {
  //   meta: {
  //     id: <freesound-sound-id>,
  //     user: <freesound-uploader>,
  //     
  //   }
  // }
  
  async _fetchNewSound(symbol) {
    // if the identifier no longer exists, do not fetch
    if (!(symbol.identifier in this.symbols)) return


    console.log(symbol)
    
    // deal with "_" keyword

    // TODO dispatch status info for this sound

    // const filters = {
    //   singleEvent: true,
    //   tonality: {
    //     root: 'C#',      // “A”, “A#”, “B”, “C”, “C#”, “D”, “D#”, “E”, “F”, “F#”, “G”, “G#”
    //     scale: 'major',  // can be 'minor'
    //   },
    //   midiNote: 74,      // numeric midi note number
    //   noteName: 'A#4',   // note name string
    //   loopable: true,
    //   noteFrequency: 440, // note frequency in hertz
    // }
    
    // compile filters
    // const queryFilters = [
    //   `ac_single_event:${filters.singleEvent}`,  // whether the clip is one distinct sound event,
    //   `ac_tonality:"${filters.tonality.rootNote} ${filters.tonality.scale}"`,  // the key the sound is in
    //   `ac_note_midi:${filters.midiNote}`,
    //   `ac_note_name:"${filters.noteName}"`,
    //   `ac_loop:${filters.loopable}`,
    //   `ac_note_frequency:${filters.noteFrequency}`,
    //   `ac_note_confidence:${0.95}`,
    // ]

    // compile filters
    const filters = reduce(
      symbol.meta.parameters,
      (acc, v, k) => `${acc}${k}:${v} `,
      ''
    )
    const filter = filters === '' ? '' : `filter=${filters}`
    // compile search fields
    const returnFields = ['id', 'name', 'previews', 'license', 'description', 'username', 'similar_sounds', 'ac_analysis'].join(',')
    
    // console.debug(`Fetching Sounds Related to: ${symbol.identifier}`)
    this.merge( {identifier: symbol.identifier, status: 'searching'} )
    this.updateVisualStatus(symbol.identifier, 'searching')
    const { results } = await fetch(
      `https://freesound.org/apiv2/search/text/?query=${symbol.identifier}&fields=${returnFields}&${filter}&page_size=150`,
      {headers: {Authorization: `Token ${API_TOKEN}`}}
    ).then(res => res.json())


    if (!results || results.length === 0) {
      // darn. no results found. mark this as unavailable.

      // mark as unavailable in symbol table
      this.merge( {identifier: symbol.identifier, status: 'unavailable'} )
      this.updateVisualStatus(symbol.identifier, 'unavailable')
      
      return
    }

    // we found results, lets start downloading the sound.
    // TODO dispatch status info for this sound
    // console.debug(`Found Sounds Related to: ${symbol.identifier}`)
    
    
    // randomly select a result from array of results
    const result = results[Math.floor(Math.random() * results.length)]
    let previewUrl = result.previews["preview-hq-mp3"]

    this.merge( {identifier: symbol.identifier, status: 'downloading'} )
    this.updateVisualStatus(symbol.identifier, 'downloading')
    
    // console.debug(`Fetching MP3 For: ${result.name}`)
    // fetch Array Buffer of Mp3
    const buffer = await fetch(previewUrl)
          .then(res => res.arrayBuffer())

    this.merge({
      identifier: symbol.identifier,
      value: await audioContext.decodeAudioData(buffer.slice(0), () => {}),
      status: 'available'
    })

    // TODO dispatch status info for this sound
    // console.debug(`Downloaded MP3 For: ${result.name}`)
    this.updateVisualStatus(symbol.identifier, 'available')
  }

  updateVisualStatus(identifier, status) {
    const elements = document.getElementsByClassName(`token-${identifier.replace(/\s+/g, '')}`)
    for (const el of elements) {
      el.classList.add(this.theme.classes[status])
    }
  }
}
