import {
  LexicalTokenType,
  SemanticTokenType,
} from '../../tokens'
import { FunctionSymbol, FunctionParameter } from '../function'
import { VolumeProcessor } from '../../ast/functions/processors/volume'


const validParameters = [
  new FunctionParameter({
    key: 'level',
    isFlag: false,
    isDefault: true,
    acceptedTypes: [LexicalTokenType.Number, LexicalTokenType.NumericalFn],
    canonicalize: tokens => {
      switch (tokens[0].type) {
      case LexicalTokenType.Number:
        return { level: tokens[0].value }
      case LexicalTokenType.NumericalFn:
        return { level_fn: tokens[0].value }
      default:
        // TODO throw an error
      }
    }
  })
]

export const Volume = new FunctionSymbol({
  id: 'volume',
  returnType: SemanticTokenType.AudioProcessorFn,
  validParameters,
  initialize: (args, {audioContext}) => new VolumeProcessor(audioContext, args)
})
