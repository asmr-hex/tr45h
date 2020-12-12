import { SemanticTokenType } from '../../tokens'
import { FunctionSymbol, FunctionParameter } from '../function'


const validParameters = [
  new FunctionParameter({}) // TODO define this
]

// this will never be called from the written text, but symbol table will use it internally
// to (1) determine if a sound literal has the proper query params provided
//    (2) to canonicalize the provided query parameters
export const SoundQuery = new FunctionSymbol({
  id: '__soundQueryFn',
  returnType: SemanticTokenType.SoundLiteral,
  validParameters, // TODO define above
  initialize: (canonicalizedArgs, {}) => { /* do something like return canonicalized arguments */}
})
