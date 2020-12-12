import { reduce } from 'lodash'

import { SemanticTokenType } from '../tokens'
import { Symbol } from './base'


// TODO also takes an array of parameters which are their own
// class (FunctionParameter). the parameters will be passed
// to the function object when the function is generated

// each instance of a function will generate a new function
// node which will be a class which encapsulates the function
// call

export class FunctionSymbol extends Symbol {
  constructor({ id, returnType, validParameters, initialize }) {
    super({id, type: SemanticTokenType.Fn})
    this.returnType = returnType
    this.validParameters = new FunctionParameters(validParameters)
    this.initialize = initialize
  }

  init(args, ctx) {
    return this.initialize(
      this.validParameters.canonicalize(args),
      ctx,
    )
  }
}

/**
 * describes valid functio parameters.
 */
export class FunctionParameter {
  constructor({key, isFlag, isDefault, acceptedTypes, canonicalize}) {
    this.key = key
    this.isFlag = isFlag || false
    this.isDefault = isFlag || false
    this.acceptedTypes = acceptedTypes || []
    this.canonicalize = canonicalize || (() => {})  // canonicalization function
  }

  isAcceptedType(type) {
    return this.acceptedTypes.includes(type)
  }
}

// takes an array of FunctionParameter
export class FunctionParameters {
  /**
   * @param {Array<FunctionParameter>} parameters
   */
  constructor(parameters) {
    this.parameters = reduce(
      parameters,
      (acc, p) => ({...acc, [p.key]: p}),
      {}
    )
  }

  // methods for checking existence of parameters

  // canonicalizing
  canonicalize(parameters) {
    return reduce(
      parameters,
      (acc, values, key) => ({
        ...acc,
        ...this.parameters[key].canonicalize(values)
      }),
      {}
    )
  }
}
