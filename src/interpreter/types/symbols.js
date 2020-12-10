

export const SymbolType = {
  Variable: 'VARIABLE',
  Function: 'FUNCTION',
  Sound:    'SOUND',
}

export const newSymbol = fields => ({
  id:     null,
  type:   null,
  status: null,
  value:  null,
  meta:   null,
  ...fields,
})
