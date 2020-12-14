import { SemanticTokenType } from '../tokens'
import { Symbol } from './base'


export class VariableSymbol extends Symbol {
  constructor({id, assignedValue, assignedValueType, declBlock}) {
    super({id, type: SemanticTokenType.Variable})
    
    this.assignedValue     = assignedValue        // value assigned to variable
    this.assignedValueType = assignedValueType    // type of value assigned to variable
    this.declBlock         = declBlock            // block where variable is declared
  }

  define(assignedValue) {
    this.assignedValue = assignedValue
  }
  // query methods
}
