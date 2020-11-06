import { Lexer } from './lexer.js'

export const interpret = str => {
  const lexer = new Lexer()
  const lexed = lexer.tokenize(str)
  
  return ["hi"]
}

// eventually we want to get the following from the parse tree.
const result = {
  sequences: {
    
  }
}

// eventually we want to be able to have an object that represents a sequence to be executed ona given step
// liek we want to be able to call
// sequence.at(idx)
// and it will resolve all variables at that step that need to be resolved.
// maybe internal datastructure for this could look like
const sequence = [
  {type: 'sound', value: "maybe its a multiword string", destination: null, ppqn: 32},
  {type: 'choice', current: { /* set this to the result of calling next() */ }, next: () => {
    /* some fn which returns an object like the one above, it caches the next
     * sound or sequence of sounds. note that this can be recursive! 
     * since we want to support having a choice (|) not only between single sounds
     * but also entire subsequences, the cached 'next' sound may actually be part of
     * a sequence of sounds.
     * the body of this next function is recursively made.
     */
  }},
]

