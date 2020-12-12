import { reduce } from 'lodash'

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
  const uniqueness = 'unique' in queryParams && queryParams['unique']
        ? `__${block}-${index}`
        : ''
  
  return `${keyword.replace(/\s+/g, '_')}__${paramString}${uniqueness}`
}

export class SoundSymbol extends Symbol {
  constructor({keyword, queryParams, block, index, themeObservable}) {
    super({
      id: createSoundLiteralId(keyword, queryParams, block, index),
      type: SemanticTokenType.SoundLiteral,
    })
    
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
    themeObservable.subscribe(theme => {
      this.statusClasses = {
        [SoundStatusType.Searching]:   theme.classes[SoundStatusType.Searching],
        [SoundStatusType.Downloading]: theme.classes[SoundStatusType.Downloading],
        [SoundStatusType.Available]:   theme.classes[SoundStatusType.Available],
        [SoundStatusType.Unavailable]: theme.classes[SoundStatusType.Unavailable],
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

  search() {
    // perform initial search
    let { count, results } = await fetch(
      this.makeSearchQueryUrl(),
      { headers: { Authorization: `Token ${this.apiToken}`}}
    ).then(r => r.json())

    // check results

    if (!results || results.length === 0) {
      // mark sound as unavailable
      this.updateStatus(SoundStatusType.Unavailable, symbolTable)
      return null
    }

    // how many pages are available?
    const availablePages = Math.ceil(count / this.queryPageSize)

    // randomly pick a page
    const randomPage = Math.ceil(Math.random() * availablePages)

    if (randomPage !== 0 && randomPage !== 1) {
      // re-query the random page
      { count, results } = await fetch(
        this.makeSearchQueryUrl(randomPage),
        { headers: { Authorization: `Token ${this.apiToken}`}}
      ).then(r => r.json())

      // check results

      if (!results || results.length === 0) {
        // mark sound as unavailable
        this.updateStatus(SoundStatusType.Unavailable, symbolTable)
        return null
      }
    }

    // randomly select a result in result list and return it
    return results[Math.floor(Math.random() * results.length)]
  }

  download(queryResult) {
    // get preview to download
    const previewUrl = queryResult.previews['preview-hq-mp3']

    // set status to downloading
    this.updateStatus(SoundStatusType.Downloading)

    // download
    this.buffer = await fetch(previewUrl)
      .then(r => r.arrayBuffer())

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
    // do fetching logic in here....! RIP OUT FROM SYMBOL TABLE

    // check whether this sound literal still exists in the symbol table registry
    if (!symbolTable.hasSound(this.id)) return
    
    // search for sounds
    const queryResult = this.search()

    // check if no results
    if (queryResult === null) return

    // download sound
    this.download(queryResult)
  }
  
  // query methods
}
