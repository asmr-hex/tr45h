import {
  debounce,
  flatMap,
  uniq,
  map,
  reduce,
  keys,
  intersection,
  xor,
} from 'lodash'
import { BehaviorSubject } from 'rxjs'
import { filter } from 'rxjs/operators'

import { audioContext } from '../../context/audio'
import { getNativeSymbols } from './nativeSymbols'
import { SemanticTokenType } from '../types/tokens'

import { Builtin } from '../types/symbols/builtin'
import { SoundSymbol } from '../types/symbols/soundLiteral'
import { VariableSymbol } from '../types/symbols/variable'


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
      refs:      {},                 // Map<BlockKey, Array<SymbolId> > references to symbols by block
      sounds:    Builtin.sounds,     // Map<SymbolId, Symbol>
      variables: Builtin.variables,  // Map<SymbolId, Symbol>
      functions: Builtin.functions,  // Map<SymbolId, Symbol>
      _query:    Builtin.query,      // internal query function for sound queries
    }

    // some config
    this.fetchWaitInterval         = 1000  // in ms
    this.garbageCollectionInterval = 5000  // in ms
    this._collectGarbage_debounced = null

    // theme observable
    this.theme = theme

    // symbol update stream
    this.updates = new BehaviorSubject(null)
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

  collectGarbage() {
    if (!this._collectGarbage_debounced) {
      this._collectGarbage_debounced = debounce(
        () => {
          // get all symbols. sounds and variables
          const allSymbols = [...keys(this.registry.variables), ...keys(this.registry.sounds)]
          const usedSymbols = uniq(flatMap(map(this.registry.refs, v => keys(v))))

          const unusedSymbols = intersection(xor(allSymbols, usedSymbols), allSymbols)

          for (const s of unusedSymbols) {
            if (s in this.registry.variables) delete this.registry.variables[s]
            if (s in this.registry.sounds) delete this.registry.sounds[s]
          }      
        },
        this.garbageCollectionInterval,
      )
    }

    this.markStaleSymbols()           // mark symbols as stale (non-debounced)
    this._collectGarbage_debounced()  // full garbage collection (debounced)
  }

  markStaleSymbols() {
    const allSounds  = keys(this.registry.sounds)
    const usedSymbols = uniq(flatMap(map(this.registry.refs, v => keys(v))))
    const staleSounds = intersection(xor(allSounds, usedSymbols), allSounds)

    // mark any used symbols that are sounds and are stale as not stale
    for (const s of usedSymbols) {
      if (s.type === SemanticTokenType.SoundLiteral && s.stale) s.stale = false
    }

    for (const s of staleSounds) {
      if (s in this.registry.sounds) this.registry.sounds[s].stale = true
    }
  }

  // used by first-pass parser to declare variable and put value type
  declareVariable(token, assignedValueType) {
    // create variable symbol
    const variable = new VariableSymbol({
      id: token.value,
      assignedValueType,
      declBlock: token.block,
      symbolTable: this,
    })

    this.addReference(variable.id, token.block, token.index)
    this.registry.variables[variable.id] = variable
  }

  // used by first-pass parser to add references to variables
  addVariableRef(id, block, index) {
    this.addReference(id, block, index)
  }

  // used by first-pass parser. adds reference and definition if doesn't exist.
  registerSound({keyword, queryParams, block, index}) {
    // create sound symbol
    const sound = new SoundSymbol({keyword, queryParams, block, index, theme: this.theme, updates: this.updates})

    // add reference to this sound
    this.addReference(sound.id, block, index)
    
    // is this sound already in the registry?
    if (this.isSound(sound.id)) return sound.id
    
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
   * @param {bool} onlyFresh only check against fresh sounds (default false).
   * @return {bool} true if exists, false otherwise
   */
  isSound(id, onlyFresh=false) {
    return id in this.registry.sounds
      && ( onlyFresh ? !this.registry.sounds[id].stale : true )
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
    return this.isVariable(id) ? this.registry.variables[id] : null
  }

  getFunction(id) {
    return this.isFn(id) ? this.registry.functions[id] : null
  }
  
  /**
   * given a semantic token, returns its corresponding symbol. returns null if symbol is not found.
   * @param {SemanticToken} token token of the symbol.
   * @return {Symbol|null} the symbol corresponding to the given id, or null.
   */
  get(token) {
    switch (token.type) {
    case SemanticTokenType.Variable:
    case SemanticTokenType.VariableDecl:
      return token.id in this.registry.variables ? this.registry.variables[token.id] : null
    case SemanticTokenType.SoundLiteral:
      return token.id in this.registry.sounds ? this.registry.sounds[token.id] : null
    case SemanticTokenType.Fn:
      return token.id in this.registry.functions ? this.registry.functions[token.id] : null
    default:
      return null
    }
  }

  getObservable(token) {
    const sym = this.get(token)
    if (!sym) return null

    // TODO okay. we will be returning the symbol observable with a filter on it for this token. (use rxjs filter on change stream)
    // return symbol AND observable
    return {
      symbol: sym,
      updates: this.updates.pipe(
        filter(
          s => s !== null
            && s.id
            && s.id === sym.id
        )
      )
    }
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
  areValidFnArgs(fnName, paramName, argTokens) {
    // TODO rename this method to be plural
    return this.isFnParameter(fnName, paramName)
      && this.registry.functions[fnName].areValidArguments(paramName, argTokens)
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


}

// TEST
// piano(note:'C4') piano(note:'D4') piano(note:'E4') piano(note:'F4') piano(note:'G4')
// violin(note:'C4')  cello(note:'D4') trumpet(note:'E4') gong(note:'F4') bell(note:'G4') sing(note:'A4') honk(note:'B4') china(note:'C5')
