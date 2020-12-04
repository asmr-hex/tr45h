
// make into classes
const paramTypes = {
  bool: {},
  key: {},
  hz: {},
  midi: {},
  name: {},
}

const nativeSymbols = {
  _soundFn: {
    type: 'fn',
    status: 'static',
    value: null,
    meta: {
      parameters: {
        unique: {
          // makes a sound unique
          isFlag: true,
          types: ['bool'],
          translate: () => ({ unique: true })
        },
        loop: {
          isFlag: true,
          types: ['bool'],
          translate: () => ({ ac_loop: true })
        },
        isolated: {
          isFlag: true,
          types: ['bool'],
          translate: () => ({ ac_single_event: true })
        },
        note: {
          types: ['key', 'hz', 'midi', 'name'],
          translate: tokens => {
            switch (tokens[0].type) {
            case 'IDENTIFIER':
              // if the first token is an identifier, it can either be a
              // * note name
              // * key
              // TODO parse this better!
              return { ac_note_name: tokens[0].value}
            case 'HZ':
              return { ac_note_frequency: tokens[0].value }
            case 'NUMBER':
              return { ac_note_midi: tokens[0].value }
              return tokens[0].value
            default:
              throw new Error('umm unsupported argument type')
            }
          },
        }
      },
    },
  },
  reverb: {
    type: 'fx',
    status: 'static',
    value: (audioContext) => { /* create new reverb node? */ }, // constructor
    meta: {
      parameters: {},
    },
  },
}

export const getNativeSymbols = () => nativeSymbols