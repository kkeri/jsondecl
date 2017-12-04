import { TransactionalMap } from './map'
import { Expression } from './model'
import { arrayToJsonPath } from './util'
import { RuntimeError } from './diag'

export const any = (x) => true

export const boolean = (x) => typeof x === 'boolean'

export const string = (x) => typeof x === 'string'

export const numeric = (x) => typeof x === 'number'

export const number = (x) => typeof x === 'number' && Number.isFinite(x)

export const finite = (x) => typeof x === 'number' && Number.isFinite(x)

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
      if (!match) return false
      if (next < value.length) {
        rc.error(`extra array items found (${value.length} instead of ${next})`, this)
        return false
      }
      return true
    } else {
      const savedMatchSet = rc.tr.matchSet
      const localMatchSet = {}
      rc.tr.matchSet = localMatchSet
      const match = this.pattern.eval(rc).test(rc, value)
      rc.tr.matchSet = savedMatchSet
      if (!match) return false
      for (let name in value) {
        if (!(name in localMatchSet)) {
          rc.error(`extra object properties found`, this)
          return false
        }
      }
      return true
    }
  }
}

export const closed = new ClosedFunction()

export function unique (value, map) {
  const path = arrayToJsonPath(this.pathStack)
  if (!(map instanceof TransactionalMap)) {
    this.error(`set argument expected`, this)
    return false
  }
  let prevPath = map.get(value)
  if (prevPath && prevPath !== path) {
    this.error(`value is not unique in set`, this)
    return false
  }
  map.set(value, path)
  return true
}

export function elementof (value, map) {
  if (!(map instanceof TransactionalMap)) {
    this.error(`set argument expected`, this)
    return false
  }
  if (!map.has(value)) {
    this.error(`value is not element of set`, this)
    return false
  }
  return true
}
