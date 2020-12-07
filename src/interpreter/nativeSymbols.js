import {
  LexicalTokenType,
  SemanticTokenType,
} from './types/tokens'


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
    type: SemanticTokenType.Fn,
    status: 'static',
    value: null,
    meta: {
      parameters: {
        unique: {
          // makes a sound unique
          isFlag: true,
          translate: () => ({ unique: true })
        },
        loop: {
          isFlag: true,
          translate: () => ({ ac_loop: true })
        },
        isolated: {
          isFlag: true,
          translate: () => ({ ac_single_event: true })
        },
        note: {
          types: [LexicalTokenType.Identifier, LexicalTokenType.Hz, LexicalTokenType.Number],
          //types: ['key', 'hz', 'midi', 'name'],
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
    type: SemanticTokenType.Fn,
    status: 'static',
    value: (audioContext) => { /* create new reverb node? */ }, // constructor
    meta: {
      parameters: {
        time: {
          types: [LexicalTokenType.Number],
          translate: tokens => {
            switch (tokens[0].type) {
            case LexicalTokenType.Number:
              return { time: tokens[0].value }
            default:
              throw new Error('unsupported arg but we should never get here')
            }
          },
        },
      },
    },
  },

  reverse: {
    type: SemanticTokenType.Fn,
    status: 'static',
    value: (audioContext) => { /* create new reverb node? */ }, // constructor
    meta: {
      parameters: {}
    },
  },

  pan: {
    type: SemanticTokenType.Fn,
    status: 'static',
    value: (audioContext) => { /* create new reverb node? */ }, // constructor
    meta: {
      parameters: {
        left: { // ?
          types: [LexicalTokenType.Number],
          translate: tokens => {
            switch (tokens[0].type) {
            case LexicalTokenType.Number:
              return { time: tokens[0].value }
            default:
              throw new Error('unsupported arg but we should never get here')
            }
          },
        },
      },
    },
  },
}

export const getNativeSymbols = () => nativeSymbols
