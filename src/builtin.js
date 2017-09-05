
export const any = (x) => true

export const boolean = (x) => typeof x === 'boolean'

export const string = (x) => typeof x === 'string'

export const number = (x) => typeof x === 'number'

export const integer = (x) => number(x) && Math.floor(x) === x

export const lt = (x, y) => number(x) && number(y) && x < y

export const le = (x, y) => number(x) && number(y) && x <= y

export const gt = (x, y) => number(x) && number(y) && x > y

export const ge = (x, y) => number(x) && number(y) && x >= y

export const closed = {
  doTest (tc, value, [pattern]) {
    if (!pattern) return false
    const savedMatchSetDepth = tc.matchSetDepth
    const savedMatchSet = tc.matchSet
    const localMatchSet = new Set()
    tc.matchSet = localMatchSet
    tc.matchSetDepth = tc.propertyDepth
    const match = pattern.doTest(tc, value)
    tc.matchSet = savedMatchSet
    tc.matchSetDepth = savedMatchSetDepth
    if (!match) return false
    for (let name in value) {
      if (!localMatchSet.has(name)) return false
    }
    return true
  }
}
