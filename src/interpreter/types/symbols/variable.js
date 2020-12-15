import { SemanticTokenType } from '../tokens'
import { Symbol } from './base'


export class VariableSymbol extends Symbol {
  constructor({id, assignedValueType, declBlock, symbolTable}) {
    super({id, type: SemanticTokenType.Variable})
    
    this.assignedValue     = null                 // value assigned to variable (will initialize as null until defined)
    this.assignedValueType = assignedValueType    // type of value assigned to variable
    this.declBlock         = declBlock            // block where variable is declared

    this.symbolTable       = symbolTable          // an instance of the symbol table
                                                  // used in resolving variable values.
  }

  define(assignedValue) {
    this.assignedValue = assignedValue
  }

  resolve() {
    // if the assigned value is, itself a variable, resolve it.
    if (this.assignedValueType === SemanticTokenType.Variable)
      return this.symbolTable.getVariable(this.assignedValue).resolve()

    return { type: this.assignedValueType, value: this.assignedValue }
  }
  
  // query methods
}
