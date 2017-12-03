import { TransactionalMap } from './map'
import { Expression } from './model'
import { arrayToJsonPath } from './util'
import { RuntimeError } from './diag'

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
  call (rc, [pattern]) {
    if (!pattern) {
      throw new RuntimeError(`pattern argument expected by 'closed'`,
        this, 'PATTERN_EXPECTED')
    }
    return new ClosedPattern(pattern)
  }
}

class ClosedPattern extends Expression {
  constructor (pattern) {
    super()
    this.pattern = pattern
  }

  test (rc, value) {
    if (Array.isArray(value)) {
      let prevArrayIndex = rc.tr.nextArrayIdx
      rc.tr.nextArrayIdx = 0
      const match = this.pattern.eval(rc).test(rc, value)
      let next = rc.tr.nextArrayIdx
      rc.tr.nextArrayIdx = Math.max(prevArrayIndex, next)
      return match && next === value.length
    } else {
      const savedMatchSet = rc.tr.matchSet
      const localMatchSet = {}
      rc.tr.matchSet = localMatchSet
      const match = this.pattern.eval(rc).test(rc, value)
      rc.tr.matchSet = savedMatchSet
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

export function elementof (value, map) {
  if (!(map instanceof TransactionalMap)) {
    // todo: error message
    return false
  }
  return map.has(value)
}
