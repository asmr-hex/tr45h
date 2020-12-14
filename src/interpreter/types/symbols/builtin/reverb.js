import {
  LexicalTokenType,
  SemanticTokenType,
} from '../../tokens'
import { FunctionSymbol, FunctionParameter } from '../function'
import { ReverbProcessor } from '../../ast/functions/processors/reverb'


const validParameters = [
  new FunctionParameter({
    key: 'time',
    isFlag: false,
    isDefault: true,
    acceptedTypes: [LexicalTokenType.Number, LexicalTokenType.NumericalFn],
    canonicalize: tokens => {
      switch (tokens[0].type) {
      case LexicalTokenType.Number:
        return { time: tokens[0].value }
      case LexicalTokenType.NumericalFn:
        return { time_fn: tokens[0].value }
      default:
        // TODO throw an error
      }
    }
  })
]

export const Reverb = new FunctionSymbol({
  id: 'reverb',
  returnType: SemanticTokenType.AudioProcessorFn,
  validParameters,
  initialize: (args, {audioContext}) => new ReverbProcessor(audioContext, args)
})
