import { interpret } from './index'


describe('the interpreter', () => {
  it('should work', () => {
    expect(interpret('this')).toEqual(["hi"])
  })
})
