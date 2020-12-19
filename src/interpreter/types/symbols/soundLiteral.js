import { reduce } from 'lodash'

import { audioContext } from '../../../context/audio'
import { SemanticTokenType } from '../tokens'
import { Symbol } from './base'


export const SoundStatusType = {
  Searching:   'SEARCHING',
  Downloading: 'DOWNLOADING',
  Available:   'AVAILABLE',
  Unavailable: 'UNAVAILABLE,'
}

export const createSoundLiteralId = (keyword, queryParams, block, index) => {
  const paramString = reduce(
    queryParams,
    (acc, v, k) => `${acc}${acc === '' ? '' : '_'}${k}-${v}`,
    ''
  )

  // if this sound literal is forcing uniqueness, append its block and index to the id.
  const uniqueness = queryParams && queryParams['unique']
        ? `__${block}-${index}`
        : ''
  
  return `${keyword.replace(/\s+/g, '_')}__${paramString}${uniqueness}`
}


/**
 * represents a sound literal symbol within the symbol table.
 *
 * @description TODO
 */
export class SoundSymbol extends Symbol {
  /**
   * constructs a new SoundSymbol.
   *
   * @description TODO
   *
   * @param {string} keyword the keyword associated with the sound.
   * @param {object} queryParams the query parameters passed to the sound literal in the program.
   * @param {string} block the block where this symbol was created.
   * @param {int} index the character index in the block where this symbol was created.
   * @param {BehaviorSubject} theme an rxjs BehaviorSubject for subscribing to theme changes.
   */
  constructor({keyword, queryParams, block, index, theme}) {
    super({
      id: createSoundLiteralId(keyword, queryParams, block, index),
      type: SemanticTokenType.SoundLiteral,
    })

    this.apiToken    = "aMdevlgMb06KIjs2yy4pkFbw9IOwq5Z6cZFWncsj"
    
    this.status      = SoundStatusType.Searching      // availability status of searched sound keyword
    this.queryParams = queryParams                    // query parameters used in keyword search
    this.keyword     = keyword                        // keyword string used for sound search
    this.buffer      = null                           // audio data sound buffer

    // enumerate return fields we wish to get from initial search query
    this.queryReturnFields = [
      'id',                // id of the sound from freesound.org
      'name',              // name of the sound from freesound.org
      'previews',          // preview urls of the sound from freesound.org
      'license',           // creative commons license of the sound from freesound.org
      'description',       // description of the sound from freesound.org
      'username',          // username of the sound uploader from freesound.org
      'similar_sounds',    // url to simillar sounds on freesound.org
      'ac_analysis',       // audio commons analysis of the sound
    ].join(',')

    // aggregate query filters
    this.queryFilters = reduce(
      this.queryParams,
      (acc, v, k) => `${acc}${k}:${v}`,
      ''
    )

    // set the number of records to return in a search query
    this.queryPageSize = 150

    // status css classes
    this.statusClasses = {}
    theme.subscribe(t => {
      this.statusClasses = {
        [SoundStatusType.Searching]:   t.classes[SoundStatusType.Searching],
        [SoundStatusType.Downloading]: t.classes[SoundStatusType.Downloading],
        [SoundStatusType.Available]:   t.classes[SoundStatusType.Available],
        [SoundStatusType.Unavailable]: t.classes[SoundStatusType.Unavailable],
      }
    })
  }

  makeSearchQueryUrl(pageNumber = null) {
    const urlBase = `https://freesound.org/apiv2/search/text/`
    const filter = this.queryFilters === '' ? '' : `filter=${this.queryFilters}`
    const pageSize = `page_size=${this.queryPageSize}`
    const page = pageNumber === null ? '' : `page=${pageNumber}`
    
    return `${urlBase}?query=${this.keyword}&fields=${this.queryReturnFields}&${filter}&${page}&${pageSize}`
  }

  async search() {
    // perform initial search
    const { count, results } = await fetch(
      this.makeSearchQueryUrl(),
      { headers: { Authorization: `Token ${this.apiToken}`}}
    ).then(r => r.json())

    // check results

    if (!results || results.length === 0) {
      // mark sound as unavailable
      this.updateStatus(SoundStatusType.Unavailable)
      return null
    }

    // how many pages are available?
    const availablePages = Math.ceil(count / this.queryPageSize)

    // randomly pick a page
    const randomPage = Math.ceil(Math.random() * availablePages)

    if (randomPage !== 0 && randomPage !== 1) {
      // re-query the random page
      const { count, results } = await fetch(
        this.makeSearchQueryUrl(randomPage),
        { headers: { Authorization: `Token ${this.apiToken}`}}
      ).then(r => r.json())

      // check results

      if (!results || results.length === 0) {
        // mark sound as unavailable
        this.updateStatus(SoundStatusType.Unavailable)
        return null
      }
    }

    // randomly select a result in result list and return it
    return results[Math.floor(Math.random() * results.length)]
  }

  async download(queryResult) {
    // get preview to download
    const previewUrl = queryResult.previews['preview-hq-mp3']
    
    // set status to downloading
    this.updateStatus(SoundStatusType.Downloading)

    // download
    
    const buffer = await fetch(previewUrl)
          .then(r => r.arrayBuffer())
    this.buffer = await audioContext.decodeAudioData(buffer.slice(0), () => {})

    //update status to available
    this.updateStatus(SoundStatusType.Available)
  }

  getStatusCssClass(status) {
    return this.statusClasses[status]
  }
  
  updateStatus(status) {
    this.status = status
    
    const elements = document.getElementsByClassName(this.id)
    for (const el of elements) {
      el.classList.add(this.getStatusCssClass(status))
    }
  }
  
  async fetch({symbolTable}) {

    // check whether this sound literal still exists in the symbol table registry
    if (!symbolTable.isSound(this.id)) return
    
    // search for sounds
    const queryResult = await this.search()

    // check if no results
    if (queryResult === null) return

    // download sound
    this.download(queryResult)

  }

  // TODO add query methods.
}
