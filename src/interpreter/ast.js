

/**
 * AST is a container for all the defined ast node types and provides a high-level API for
 * operating over a current AST state.
 *
 * @description this container is important because we need to support
 *  (1) finding AST nodes which contain a region of text
 *  (2) replacing nodes within the AST as they are updated.
 *
 * this will require some indexing and book-keeping.
 */
export class AST {
  constructor() {
    this.program = null
  }

  diff() {
    
  }

  replace() {
    
  }
}
