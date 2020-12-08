

describe('The First Pass Parser', () => {

  //////////////////////////////
  //                          //
  //  INTERNAL STATE METHODS  //
  //                          //
  //////////////////////////////
  
  describe('reset()', () => {
    it('initializes internal state', () => {
      expect().toBeTruthy()
    })
  })

  describe('peek()', () => {
    describe('given no parameters', () => {
      it('returns the current stream token', () => {
        expect().toBeTruthy()
      })
      it('returns null at the end of the token stream', () => {
        expect().toBeTruthy()
      })
    })
    describe('given positive skipAhead param', () => {
      it('returns the next stream token', () => {
        expect().toBeTruthy()
      })
      it('returns null if the skipAhead is out of bounds', () => {
        expect().toBeTruthy()
      })
    })
    describe('given negative skipAhead param', () => {
      it('returns the previous stream token', () => {
        expect().toBeTruthy()
      })
      it('returns null if the skipAhead is out of bounds', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('getLastTokenEnd()', () => {
    it('needs a better name...', () => {
      expect().toBeTruthy()
    })
  })

  describe('advance()', () => {
    describe('when not at the terminal stream token', () => {
      it('returns the next token and increments the index', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the terminal stream token', () => {
      it('returns null and increments the index', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('consume()', () => {
    it('returns the current token and increments the index', () => {
      expect().toBeTruthy()  
    })
  })

  describe('pushToken()', () => {
    it('appends a new semantic token onto the result token array', () => {
      expect().toBeTruthy()
    })
  })

  describe('pushError()', () => {
    it('appends a new error token onto the result error array', () => {
      expect().toBeTruthy()
    })
  })

  ////////////////////
  //                //
  //  TEST METHODS  //
  //                //
  ////////////////////

  describe('isAssignment()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid assignments', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid assignments', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isSequence()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid sequence', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid sequence', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isComment()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid comment', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid comment', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isNumber()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid number', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid number', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })
  
  describe('isHz()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid hz number', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid hz number', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isChoice()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid choice', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid choice', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isChoiceParameter()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid choice parameter', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid choice parameter', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isChainOperator()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid chain operator', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid chain operator', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isRepetitionOperator()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid repetition operator', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid repetition operator', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isVariable()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid variable', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid variable', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isFn()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid function', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid function', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isSoundLiteral()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid sound literal', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid sound literal', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isQueryParameters()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid sound literal with query parameters', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid sound literal with query parameters', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isFnParameters()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid function with query parameters', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid function with query parameters', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  describe('isFnParameters()', () => {
    describe('when at the end of a token stream', () => {
      it('returns false', () => {
        expect().toBeTruthy()  
      })
    })
    describe('when at the final token', () => {
      it('returns false', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at valid function with query parameters', () => {
      it('returns true, given __ ', () => {
        expect().toBeTruthy()
      })
    })
    describe('when at invalid function with query parameters', () => {
      it('returns false, given __ ', () => {
        expect().toBeTruthy()
      })
    })
  })

  ////////////////////
  //                //
  // PARSE METHODS  //
  //                //
  ////////////////////
})
