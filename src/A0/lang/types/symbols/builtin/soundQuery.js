import { LexicalTokenType, SemanticTokenType } from '../../tokens'
import { FunctionSymbol, FunctionParameter } from '../function'


const validParameters = [
  new FunctionParameter({
    key: 'note',
    isFlag: false,
    isDefault: true,
    acceptedTypes: [
      LexicalTokenType.Identifier,
      LexicalTokenType.Hz,
      LexicalTokenType.Number,
    ],
    canonicalize: tokens => {
      switch (tokens[0]) {
      case LexicalTokenType.Identifier:
        // if the first token is an identifier, it can either be a
        // * note name  ac_note_name
        // * key        ac_tonality
        // TODO parse this better!
        return { ac_note_name: tokens[0].value}
      case LexicalTokenType.Hz:
        return { ac_note_frequency: tokens[0].value }
      case LexicalTokenType.Number:
        return { ac_note_midi: tokens[0].value }
      default:
        // TODO throw an error
      }
    }
  }),
  new FunctionParameter({
    key: 'loop',
    isFlag: true,
    isDefault: false,
    acceptedTypes: [],
    canonicalize: tokens => ({ ac_loop: true }),
  }),
  new FunctionParameter({
    key: 'unique',
    isFlag: true,
    isDefault: false,
    acceptedTypes: [],
    canonicalize: tokens => ({ unique: true }),
  }),
  new FunctionParameter({
    key: 'isolated',
    isFlag: true,
    isDefault: false,
    acceptedTypes: [],
    canonicalize: tokens => ({ ac_single_event: true }),
  }),
]

// this will never be called from the written text, but symbol table will use it internally
// to (1) determine if a sound literal has the proper query params provided
//    (2) to canonicalize the provided query parameters
export const SoundQuery = new FunctionSymbol({
  id: '__soundQueryFn',
  returnType: SemanticTokenType.SoundLiteral,
  validParameters,
  initialize: (canonicalizedArgs) => canonicalizedArgs  // just return canonicalized arguments
})
