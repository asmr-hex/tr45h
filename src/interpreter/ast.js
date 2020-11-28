import randomColor from 'randomcolor'


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
    // the program is represented by an array of statements
    this.program = []

    // mapping from statement key to index in program array. These indices
    // do not correspond to the indices in the program array, but rather the
    // block indices in the text editor. since there may be empty blocks, the
    // index must be sorted against all indices stored in here to get the index
    // corresponding to the program array index.
    this.statementKeyToIndex = {}

    //
    this.statementKeyToMetaData = {}
  }

  /**
   * merges an AST Node into the program AST.
   *
   * @description this method handles merging in entire statements that have been
   * changed and reparsed.
   *
   * @param {NodeAST} statement the statement to merge into the AST.
   * @param {string} blockKey the block key of the statement to merge.
   * @param {int} blockIndex the block index of the statement to merge.
   */
  merge(statement, blockKey, blockIndex) {
    // does this block already exist?
    if (blockKey in this.statementKeyToIndex) {
      // did the index change?
      if (this.statementKeyToIndex[blockKey] !== blockIndex)
        this.statementKeyToIndex[blockKey] = blockIndex
    } else {
      // insert the new block to the key -> index map
      this.statementKeyToIndex[blockKey] = blockIndex
    }
    
    // replace the statement at this index
    this.program[this._normalizeIndex(blockKey)] = statement
  }
  
  diff() {
    
  }

  replace() {
    
  }

  purge() {
    
  }

  getStatementMetaData(key) {
    return key in this.statementKeyToMetaData
      ? this.statementKeyToMetaData[key]
      : this._createStatementMetaData(key)
  }
  
  /**
   * returns the program array index.
   *
   * @param {string} blockKey the block key for which we wish to get the normalized index.
   *
   * @return {int} normalizedIndex.
   */
  _normalizeIndex(blockKey) {
    // sort block keys by non-normalized indices
    return Object.entries(this.statementKeyToIndex)
      .sort((a, b) => a[1] - b[1])
      .map(e => e[0])
      .indexOf(blockKey)
  }

  _createStatementMetaData(key) {
    const metaData = {
      color: randomColor({ luminosity: 'light' })
    }
    
    // pick random color that is different from surrounding colors
    this.statementKeyToMetaData[key] = metaData

    return metaData
  }
}
