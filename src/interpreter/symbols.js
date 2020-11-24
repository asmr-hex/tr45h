import { filter } from 'lodash'

import { audioContext } from '../context/audio'


const API_TOKEN = "aMdevlgMb06KIjs2yy4pkFbw9IOwq5Z6cZFWncsj"

// soundwords
// fx
// symbols are entires of identifiers as keys
// with an object as a value with different fields
// {
//   'apple': {
//     type: 'sound',
//     status: 'downloading',
//     value: <bytes>
//   },
//   'reverb': {
//     type: 'fx',
//     status: 'ready',
//     value: <fn>
//   }
// }
export class SymbolTable {
  constructor() {
    this.symbols = {}
  }

  // {
  //   identifier: <identifier>,
  //   type: <type>,
  //   status: <status>,
  //   value: <value>
  // }
  merge(symbol) {
    // is this a new symbol?
    const exists = symbol.identifier in this.symbols
          
    // get existing or default fields
    const fields = exists
          ? this.symbols[symbol.identifier]
          : { type: null, status: null, value: null }

    // merge symbol
    this.symbols[symbol.identifier] = {
      ...fields,
      ...symbol,
    }

    if (!exists && symbol.type && symbol.type === 'sound')
      // this identifier is a new sound, we need to resolve it
      this._fetchNewSound(symbol)
  }

  get(identifier) {
    return identifier in this.symbols
      ? this.symbols[identifier]
      : null
  }
  
  remove(identifier) {
    delete this.symbols[identifier]
  }

  async _fetchNewSound(symbol) {
    // deal with "_" keyword

    // TODO dispatch status info for this sound
    
    // console.debug(`Fetching Sounds Related to: ${symbol.identifier}`)
    this.merge( {identifier: symbol.identifier, status: 'searching'} )
    this.updateVisualStatus(symbol.identifier, 'searching')
    const { results } = await fetch(
      `https://freesound.org/apiv2/search/text/?query=${symbol.identifier}&fields=name,previews&page_size=150`,
      {headers: {Authorization: `Token ${API_TOKEN}`}}
    ).then(res => res.json())


    if (results.length === 0) {
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
    
    // ======== DEBUGGING================
    switch (symbol.identifier) {
    case 'c':
      previewUrl = "https://freesound.org/data/previews/505/505410_3327701-hq.mp3"
      break
    case 'a':
      previewUrl = "https://freesound.org/data/previews/95/95326_1579599-hq.mp3"
      break
    case 'f':
      previewUrl = "https://freesound.org/data/previews/56/56123_692344-hq.mp3"
      break      
    }

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
      el.classList.add(status)
    }
  }
}
