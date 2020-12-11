

export class ProcessorChain {
  constructor() {
    this.processors = []    // the array of processors, applied in left to right order.
    this.input      = null  // the input processor node of the processor chain.
    this.isEmpty    = true  // whether the chain is empty
  }

  /**
   * adds an AudioProcessor to the processor chain.
   *
   * @description when a new processor is added, the previous processor in the chain
   * is connected to the newest tail. if it is the first processor in the chain, it's
   * input is set as the input of the entire processor chain and the chain is marked
   * as non-empty.
   *
   * @param {AudioProcessor} processor the audio processor node to add to the chain.
   */
  add(processor) {
    this.processors.push(processor)

    if (this.processors.length === 1) {
      // if this is the first processor in the chain, set it's input as the input for
      // the entire chain and mark the chain as non-empty.
      this.input = this.processors[0].input
      this.isEmpty = false
    } else if (this.processors.length >= 2) {
      // hookup the previous processor with the newest chain tail.
      this.penultimateProcessor().connect(this.finalProcessor())
    }
  }

  /**
   * connects a destination node to the output of the processor chain.
   * @param {AudioDestinationNode} destination the audio node to connect the chain's output to.
   */
  connect(destination) {
    this.finalProcessor().connect(destination)
  }

  /**
   * updates each processor in the processor chain.
   */
  update() {
    this.processors.forEach(processor => processor.update())
  }
  
  finalProcessor() { return this.processors[this.processors.length - 1] }
  penultimateProcessor() { return this.processors[this.processors.length -2] }
}
