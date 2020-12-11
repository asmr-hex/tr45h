import { SemanticTokenType } from '../../tokens'
import { FunctionSymbol, FunctionParameter } from '../function'
import { VolumeProcessor } from '../../ast/functions/processors/volume'


const parameters = [
  new FunctionParameter({
    key: 'level',
    isFlag: false,
    isDefault: true,
    acceptedTypes: [LexicalTokenType.Number, LexicalTokenType.NumericalFn],
    canonicalize: tokens => {
      switch (tokens[0].type) {
      case LexicalTokenType.Number:
        return { level: token[0].value }
      case LexicalTokenType.NumericalFn:
        return { level_fn: token[0].value }
      }
    }
  })
]

export const Volume = new FunctionSymbol({
  id: 'volume',
  returnType: SemanticTokenType.AudioProcessorFn,
  parameters,
  initialize: (parameters, {audioContext}) => new VolumeProcessor(audioContext, parameters)
})
