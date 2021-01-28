

/**
 * base class for all audio processors.
 *
 * @description this class exposes an input and an output (via the 'connect()'
 * method) and embeds a copy of the Web API AudioContext for use in derived
 * classes. derived classes must set the 'input' and 'output' attributes.
 * Additionally, there is an optional 'update' method exposed in the API which
 * allows derived classes to update arbitrary internal state when it is called.
 * this method will be called each time the processor chain to which the derived
 * class belongs is connected to an input.
 *
 */
export class AudioProcessor {
  constructor(audioContext) {
    this.audioContext = audioContext  // embedded Audio Context
    this.input        = null          // processor input node
    this.output       = null          // processor output node
  }

  /**
   * connects a destination node to the output of the processor.
   * @param {AudioDestinationNode} destination the audio node to connect the procesors's output to.
   */
  connect(destination) {
    this.output.connect(destination)
  }

  /**
   * method for updating a processor's internal state.
   */
  update() {}
}
