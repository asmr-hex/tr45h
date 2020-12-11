

export const SoundStatusType = {
  Searching:   'SEARCHING',
  Downloading: 'DOWNLOADING',
  Available:   'AVAILABLE',
  Unavailable: 'UNAVAILABLE,'
}

export const newSymbol = fields => ({
  id:     null,
  type:   null,
  status: null,
  value:  null,
  meta:   null,
  ...fields,
})


export const newSoundSymbol = fields => ({
  id:         null,
  type:       SemanticTokenType.SoundLiteral,
  status:     SoundStatusType.Searching,
  value:      null,
  parameters: {},
  ...fields,
})

export const newFunctionSymbol = fields => ({
  id: null,
  type: SemanticTokenType.Fn,
  returnType: null,
  parameters: {},
  function: null,
  ...fields,
})

// TODO variables need to specify their return type....
export const newVariableSymbol = fields => ({
  id: null,
  type: SemanticTokenType.Variable,
  value: null,
  valueType: null,
  declBlock: null,
  ...fields,
})
