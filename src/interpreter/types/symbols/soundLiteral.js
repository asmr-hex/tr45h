import { SemanticTokenType } from '../tokens'
import { Symbol } from './base'


export const SoundStatusType = {
  Searching:   'SEARCHING',
  Downloading: 'DOWNLOADING',
  Available:   'AVAILABLE',
  Unavailable: 'UNAVAILABLE,'
}

export const createSoundLiteralId = (keyword, queryParams) => {
  const paramString = reduce(
    parameters,
    (acc, v, k) => `${acc}${acc === '' ? '' : '_'}${k}-${v}`,
    ''
  )

  return `${keyword.replace(/\s+/g, '_')}__${paramString}`
}

export class SoundSymbol extends Symbol {
  constructor({keyword, queryParams}) {
    super({
      id: createSoundLiteralId(keyword, queryParams),
      type: SemanticTokenType.SoundLiteral,
    })
    
    this.status      = SoundStatusType.Searching      // availability status of searched sound keyword
    this.queryParams = queryParams                    // query parameters used in keyword search
    this.keyword     = keyword                        // keyword string used for sound search
  }

  async fetch({symbolTable}) {
    // do fetching logic in here....! RIP OUT FROM SYMBOL TABLE
    
  }
  
  // query methods
}
