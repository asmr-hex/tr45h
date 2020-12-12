import { SemanticTokenType } from '../tokens'
import { Symbol } from './base'


export const SoundStatusType = {
  Searching:   'SEARCHING',
  Downloading: 'DOWNLOADING',
  Available:   'AVAILABLE',
  Unavailable: 'UNAVAILABLE,'
}


export class SoundSymbol extends Symbol {
  constructor({id, keyword, parameters}) {
    super({id, type: SemanticTokenType.SoundLiteral})
    
    this.status = SoundStatusType.Searching           // availability status of searched sound keyword
    this.parameters = parameters                      // query parameters used in keyword search
    this.keyword = keyword                            // keyword string used for sound search
  }

  fetch(keyword, parameters, {symbolTable}) {
    // do fetching logic in here....?
  }
  
  // query methods
}
