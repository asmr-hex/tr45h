import {
  flatMap,
  uniq,
  reduce,
} from 'lodash'

import { audioContext } from '../../context/audio'
import { getNativeSymbols } from './nativeSymbols'
import { SemanticTokenType } from '../types/tokens'

import { Builtin } from '../types/symbols/builtin'
import { SoundSymbol } from '../types/symbols/soundLiteral'


const API_TOKEN = "aMdevlgMb06KIjs2yy4pkFbw9IOwq5Z6cZFWncsj"


/**
 * registers user-defined and builtin identifiers to be used within the program.
 *
 * @description TODO
 *
 */
export class SymbolTable {

  /**
   * constructs a new symbol table.
   * @param {BehaviorSubject} theme an rxjs BehaviorSubject for subscribing to theme changes.
   */
  constructor(theme) {
    // registry of all known symbols
    this.registry = {
      ref:       {},                 // Map<BlockKey, Array<SymbolId> > references to symbols by block
      sounds:    Builtin.sounds,     // Map<SymbolId, Symbol>
      variables: Builtin.variables,  // Map<SymbolId, Symbol>
      functions: Builtin.functions,  // Map<SymbolId, Symbol>
      _query:    Builtin.query,      // internal query function for sound queries
    }

    // some config
    this.activeIdentifiersByBlock = {} // TODO replace with registry.refs
    this.fetchWaitInterval = 1000  // in ms

    // theme observable
    this.theme = {}
    theme.subscribe(t => this.theme = t)
  }

  
  ////////////////////////////
  //                        //
  //  REGISTRATION METHODS  //
  //                        //
  ////////////////////////////

  clearBlockRefs(block) {
    delete this.registry.refs[block]
  }
  
  addReference(symbolId, block, index) {
    // get existing block refs
    const blockRefs = block in this.registry.refs ? this.registry.refs[block] : {}
    const symbolRefs = symbolId in blockRefs ? blockRefs[symbolId] : []
    
    this.registry.refs[block] = {
      ...blockRefs,
      [symbolId]: [...symbolRefs, index]
    }
  }

  // used by first-pass parser to declare variable and put value type
  declareVariable(token, assignedValueType) {
    // create variable symbol
    const variable = new VariableSymbol({
      variable: token.value,
      assignedValueType,
      declBlock: token.block,
    })

    this.registry.variables[variable.id] = variable
  }

  // used by second-pass parser to actually put variable value 
  defineVariable() {}

  // used by first-pass parser to add references to variables
  addVariableRef(id, block, index) {
    this.addReference(id, block, index)
  }

  // used by first-pass parser. adds reference and definition if doesn't exist.
  registerSound({keyword, queryParams, block, index}) {
    // create sound symbol
    const sound = new SoundSymbol({keyword, queryParams, block, index, theme})

    // add reference to this sound
    this.addReference(sound, block, index)
    
    // is this sound already in the registry?
    if (this.hasSound(sound.id)) return
    
    // add to registry
    this.registry.sounds[sound.id] = sound

    // start fetching new sound (but after timeout)
    setTimeout(() => sound.fetch({symbolTable: this}), this.fetchWaitInterval)
    
    return sound.id
  }

  /////////////////////
  //                 //
  //  QUERY METHODS  //
  //                 //
  /////////////////////

  /**
   * given a sound symbol id, returns true if it exists within the registry, false otherwise.
   * @param {string} id sound literal id in question.
   * @return {bool} true if exists, false otherwise
   */
  isSound(id) {
    return id in this.registry.sounds
  }

  /**
   * given a sound symbol id, returns the sound if it exists inthe registry, returns null otherwise.
   * @param {string} id sound literal id in question.
   * @return {SoundSymbol|null} sound symbol or null
   */
  getSound(id) {
    return this.isSound(id) ? this.registry.sounds[id] : null
  }

  getVariable(id) {
    return this.isVariable(id) ? this.registry.variable(id) : null
  }
  
  /**
   * given a symbol id, returns its corresponding symbol. returns null if symbol is not found.
   * @param {string} id the id of the symbol.
   * @return {Symbol|null} the symbol corresponding to the given id, or null.
   */
  get(id) {
    return id in this.symbols ? this.symbols[id] : null
  }
  
  /**
   * returns true if the given identifier is a function, otherwise returns false.
   * @param {string} identifier the identifier to check.
   * @return {bool} true if it is a function, false otherwise.
   */
  isFn(identifier) {
    return !!this.registry.functions[identifier]
      && this.registry.functions[identifier].type === SemanticTokenType.Fn
  }

  /**
   * returns true if the given identifier is a variable, otherwise returns false.
   * @param {string} identifier the identifier to check.
   * @return {bool} true if it is a variable, false otherwise.
   */
  isVariable(identifier) {
    return identifier in this.registry.variables
      && this.registry.variables[identifier].type === SemanticTokenType.Variable
  }
  
  /**
   * returns true if this is a valid query parameter for a sound, false otherwise.
   * @param {string} paramName the parameter name in question.
   * @return {bool} true if it is a valid sound query parameter, false otherwise.
   */
  isQueryParameter(paramName) {
    return this.registry._query.isValidParameter(paramName)
  }

  /**
   * returns true if this is a valid function parameter for a sound, false otherwise.
   * @param {string} fnName the name of the function.
   * @param {string} paramName the name of the potential function parameter.
   * @return {bool} returns true if it is a parameter for the given function, false otherwise.
   */
  isFnParameter(fnName, paramName) {
    return this.isFn(fnName)
      && this.registry.functions[fnName].isValidParameter(paramName)
  }

  /**
   * returns true if the parameter is a boolean flag parameter, false otherwise.
   * @param {string} fnName the name of the function.
   * @param {string} paramName the name of the potential flag function parameter.
   * @return {bool} returns true if it is a boolean flag parameter for the given function, false otherwise.
   */
  isFnFlagParameter(fnName, paramName) {
    return this.isFnParameter(fnName, paramName)
      && !!this.registry.functions[fnName].isFlagParameter(paramName)
  }

  /**
   * returns true if the given value token for a function parameter is valid (in type and value), false otherwise.
   * @param {string} fnName the name of the function.
   * @param {string} paramName the name of the function parameter.
   * @param {LexicalToken} argToken the function parameter value in question
   */
  isValidFnArg(fnName, paramName, argTokens) {
    // TODO rename this method to be plural
    return this.isFnParameter(fnName, paramName)
      && this.registry.functions[fnName].areValidArguments(paramName, argTokens)
  }

  /**
   * translates input tokens for a function argument, returning a canonicalized mapping of k-v pairs.
   *
   * @description this method exists because the parameters used in alea-lang may not always map directly
   * onto the parameter names of the underlying functions that the alea-lang functions will invoke. Moreover,
   * the mapping may also even be one-to-many, e.g. one alea-lang argument could map to several parameters of
   * the underlying function(s) being executed in Javascript.
   *
   * @param {string} fnName the function name.
   * @param {string} paramName the function parameter name.
   * @param {Array<LexicalToken>} argTokens an array of value tokens.
   * @return {Object} a mapping from canonicalized parameter names to values.
   */
  translateFnArgs(fnName, paramName, argTokens) {
    return this.isValidFnArg(fnName, paramName, argTokens[0]) // TODO should isValidFnArg accept an array?
    && this.symbols[fnName].meta.parameters[paramName].translate(argTokens)
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
    const exists = symbol.id in this.symbols
          
    // get existing or default fields
    const fields = exists
          ? this.symbols[symbol.id]
          : { id: symbol.id, type: null, identifier: symbol.identifier, status: null, value: null, meta: null}

    // merge symbol
    this.symbols[symbol.id] = {
      ...fields,
      ...symbol,
    }

    if (!exists && symbol.type && symbol.type === 'sound')
      // this identifier is a new sound, we need to resolve it
      setTimeout(() => this._fetchNewSound(symbol), this.fetchWaitInterval)
  }

  remove(id) {
    if (this.symbols[id].status !== 'static')
      delete this.symbols[id]
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
    if (!(symbol.id in this.symbols)) return


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
    console.log(symbol.meta.parameters)
    const filters = reduce(
      symbol.meta.parameters,
      (acc, v, k) => `${acc}${k}:${v} `,
      ''
    )
    const filter = filters === '' ? '' : `filter=${filters}`
    // compile search fields
    const returnFields = ['id', 'name', 'previews', 'license', 'description', 'username', 'similar_sounds', 'ac_analysis'].join(',')
    
    console.debug(`Fetching Sounds Related to: ${symbol.id}`)
    this.merge( {id: symbol.id, status: 'searching'} )
    this.updateVisualStatus(symbol.id, 'searching')
    const { results } = await fetch(
      `https://freesound.org/apiv2/search/text/?query=${symbol.identifier}&fields=${returnFields}&${filter}&page_size=150`,
      {headers: {Authorization: `Token ${API_TOKEN}`}}
    ).then(res => res.json())


    if (!results || results.length === 0) {
      // darn. no results found. mark this as unavailable.

      // mark as unavailable in symbol table
      this.merge( {id: symbol.id, status: 'unavailable'} )
      this.updateVisualStatus(symbol.id, 'unavailable')
      
      return
    }

    // we found results, lets start downloading the sound.
    // TODO dispatch status info for this sound
    console.debug(`Found Sounds Related to: ${symbol.id}`)
    
    
    // randomly select a result from array of results
    const result = results[Math.floor(Math.random() * results.length)]
    let previewUrl = result.previews["preview-hq-mp3"]

    this.merge( {id: symbol.id, status: 'downloading'} )
    this.updateVisualStatus(symbol.id, 'downloading')
    
    // console.debug(`Fetching MP3 For: ${result.name}`)
    // fetch Array Buffer of Mp3
    const buffer = await fetch(previewUrl)
          .then(res => res.arrayBuffer())

    this.merge({
      id: symbol.id,
      value: await audioContext.decodeAudioData(buffer.slice(0), () => {}),
      status: 'available'
    })

    // TODO dispatch status info for this sound
    console.debug(`Downloaded MP3 For: ${result.name}`)
    this.updateVisualStatus(symbol.id, 'available')
  }

  updateVisualStatus(identifier, status) {
    const elements = document.getElementsByClassName(`token-${identifier.replace(/\s+/g, '')}`)
    for (const el of elements) {
      el.classList.add(this.theme.classes[status])
    }
  }

  ////////////////////////////////////
  //                                //
  //  "GARBAGE COLLECTION" METHODS  //
  //                                //
  ////////////////////////////////////

  // variables can be declared if
  // (1) there is no other variable declaration of the same (edge case, there is one but it is on ehte same block ())
  // (2) there are no sound literals that share the same name

  // variable /variable decl behavior
  // * a variable needs to be declared before usage (if there is an existing sound literal with the same id as a variable, its an error)
  // * when a variable has been declared and it is used in other statements
  //   - if it is deleted, it will by default look up a sound literal with the same id as the variable
  //   - when the variable is modified, statements using it will immediately get those updates
  
  // how to handle garbage collecting of different symbol types:
  // * variable/variable decl - when a variable declaration is removed and there still exist references to it, replace with the equivalent sound literal
  //                            if there are no references to it in any block, purge it from the symbol table
  // * sound literal - when there are no references to it in any block
  //                   - eventually this also goes for imported sound literals and variables

  // notes: so we should keep a blockRefRegistry - referenced sybmols by block

  // question: should there be a distinction between variable usage and declaration in symbol table?
  
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

    // const allActiveIdentifiers = uniq(flatMap(values(this.activeIdentifiersByBlock)))
    // const identifiersInSymbolTable = keys(this.symbols)

    // const danglingIdentifiers = intersection(xor(identifiersInSymbolTable, allActiveIdentifiers), identifiersInSymbolTable)

    // TODO DEBUGGING BECAUSE WE NEED TO FIGURE OUT HOW TO DEAL WITH REMOVING
    // DANGLING IDENTIFIERS NOW THAT SOUNDS UNIQUENESS IS DEPENDENT ON PARAMETERS
    
    // remove dangling identifiers
    // for (const danglingIdentifier of danglingIdentifiers) {
    //   this.remove(danglingIdentifier)
    // }
  }

}

// TEST
// piano(note:'C4') piano(note:'D4') piano(note:'E4') piano(note:'F4') piano(note:'G4')
// violin(note:'C4')  cello(note:'D4') trumpet(note:'E4') gong(note:'F4') bell(note:'G4') sing(note:'A4') honk(note:'B4') china(note:'C5')
