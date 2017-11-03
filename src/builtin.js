import { TransactionalMap } from './map'
import { Expression } from './model'
import { arrayToJsonPath } from './util'

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

class ClosedFunction extends Expression {
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
    if (Array.isArray(value)) {
      let prevArrayMatchLimit = tc.tr.arrayMatchLimit
      tc.tr.arrayMatchLimit = 0
      const match = this.pattern.doEval(tc).doTest(tc, value)
      let limit = tc.tr.arrayMatchLimit
      tc.tr.arrayMatchLimit = Math.max(prevArrayMatchLimit, limit)
      return match && limit === value.length
    } else {
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
}

export const closed = new ClosedFunction()

export function unique (value, map) {
  const path = arrayToJsonPath(this.pathStack)
  if (!(map instanceof TransactionalMap)) {
    // todo: error message
    return false
  }
  let prevPath = map.get(value)
  if (prevPath && prevPath !== path) {
    // todo: error message
    return false
  }
  map.set(value, path)
  return true
}

export function inside (value, map) {
  if (!(map instanceof TransactionalMap)) {
    // todo: error message
    return false
  }
  return map.has(value)
}
