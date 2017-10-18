import { TransactionalSet } from './set'
import { Expression } from './model'

export const any = (x) => true

export const boolean = (x) => typeof x === 'boolean'

export const string = (x) => typeof x === 'string'

export const number = (x) => typeof x === 'number'

export const integer = (x) => number(x) && Math.floor(x) === x

export const eq = (x, y) => number(x) && number(y) && x === y

export const ne = (x, y) => number(x) && number(y) && x !== y

export const lt = (x, y) => number(x) && number(y) && x < y

export const le = (x, y) => number(x) && number(y) && x <= y

export const gt = (x, y) => number(x) && number(y) && x > y

export const ge = (x, y) => number(x) && number(y) && x >= y

export const closed = {
  call (tc, [pattern]) {
    if (!pattern) {
      tc.error(`closed requires a pattern argument`)
      return new Expression()
    }
    return new ClosedPattern(pattern)
  }
}

class ClosedPattern extends Expression {
  constructor (pattern) {
    super()
    this.pattern = pattern
  }

  doTest (tc, value) {
    const savedMatchSet = tc.tr.matchSet
    const localMatchSet = {}
    tc.tr.matchSet = localMatchSet
    const match = this.pattern.doEval(tc).doTest(tc, value)
    tc.tr.matchSet = savedMatchSet
    if (!match) return false
    for (let name in value) {
      if (!(name in localMatchSet)) return false
    }
    return true
  }
}

export const unique = function (value, set) {
  if (!(set instanceof TransactionalSet)) {
    // todo: error message
    return false
  }
  if (set.has(value)) {
    // todo: error message
    return false
  }
  set.add(value)
  return true
}
