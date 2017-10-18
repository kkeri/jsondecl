import { TransactionalSet } from './set'
import * as model from './model'

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
      return new model.Expression()
    }
    return new ClosedPattern(pattern)
  }
}

class ClosedPattern extends model.Expression {
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

// export const newSet = {
//   doEval (tc) {
//     return new TransactionalSet(tc, new Set())
//   }
// }

export const unique = {
  call (tc, [set]) {
    set = set.doEval(tc).getNativeValue(tc)
    if (!(set instanceof TransactionalSet)) {
      // todo: error message
      return false
    }
    return new UniquePattern(set)
  }
}

class UniquePattern extends model.Expression {
  constructor (set) {
    super()
    this.set = set
  }

  doTest (tc, value) {
    if (this.set.has(value)) {
      // todo: error message
      return false
    }
    this.set.add(value)
    return true
  }
}
