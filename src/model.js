import { TestContext } from './context'

export class Module {
  constructor (importList, declList) {
    this.importList = importList
    this.declList = declList
    this.exports = {}
    this.defaultExport = undefined
  }

  test (value, id = '') {
    if (id === '') {
      if (!this.defaultExport) {
        throw new Error('attempt to test against the default declaration but it is not declared')
      }
      return this.defaultExport.test(value)
    } else {
      if (!(id in this.exports)) {
        throw new Error(`attempt to test against '${id}' but it is not declared`)
      }
      return this.exports[id].test(value)
    }
  }
}

export class Import {
  constructor (moduleSpec, importList) {
    this.moduleSpec = moduleSpec
    this.importList = importList
  }
}

export class ImportSpecifier {
  constructor (originalId, localId) {
    this.originalId = originalId
    this.localId = localId
  }
}

export class Declaration {
  constructor (id, body, exported) {
    this.id = id
    this.body = body
    this.exported = exported
  }

  test (value) {
    if (!this.env) {
      throw new Error(`a declaration in a parametric environment can't ` +
      `be tested independently`)
    }
    const tc = new TestContext(this.env)
    return this.body.doTest(tc, value)
  }
}

// expression

export class Expression {
  constructor () {
    if (new.target === Expression) {
      throw new Error(`can't instantiate abstract class`)
    }
  }

  doEval (tc, value) {
    throw new Error(`the expression should be used as pattern`)
  }

  doTest (tc, value) {
    throw new Error(`the expression can't be used as pattern`)
  }
}

export class LocalEnvironment extends Expression {
  constructor (declList, body) {
    super()
    this.declList = declList
    this.body = body
  }

  doTest (tc, value) {
    let savedEnv = tc.env
    if (this.env) {
      tc.env = this.env
    } else {
      tc.env = Object.assign(Object.create(tc.env), this.staticEnv)
    }
    let result = this.body.doTest(tc, value)
    tc.env = savedEnv
    return result
  }
}

export class LogicalOr extends Expression {
  constructor (items) {
    super()
    this.items = items
  }

  doTest (tc, value) {
    let result = false
    for (let item of this.items) {
      tc.begin()
      if (item.doTest(tc, value)) {
        tc.commit()
        result = true
        // todo: continue iteration only if unique or closed is in effect
      } else {
        tc.rollback()
      }
    }
    return result
  }
}

export class LogicalAnd extends Expression {
  constructor (items) {
    super()
    this.items = items
  }

  doTest (tc, value) {
    for (let item of this.items) {
      if (!item.doTest(tc, value)) {
        return false
      }
    }
    return true
  }
}

export class LogicalNot extends Expression {
  constructor (expr) {
    super()
    this.expr = expr
  }

  doTest (tc, value) {
    tc.begin()
    var result = !this.expr.doTest(tc, value)
    tc.rollback()
    return result
  }
}

export class Chain extends Expression {
  constructor (items) {
    super()
    this.items = items
  }

  doEval (value) {
    for (let item of this.items) {
      value = item.doEval(value)
    }
    return value
  }

  doTest (tc, value) {
    let max = this.items.length - 1
    for (let i = 0; i < max; i++) {
      value = this.items[i].doEval(tc, value)
    }
    return this.items[max].validate(tc, value)
  }
}

export class Reference extends Expression {
  constructor (id) {
    super()
    this.id = id
  }

  doEval (tc) {
    let expr = tc.env[this.id].body
    return expr.doEval(tc)
  }

  doTest (tc, value) {
    let expr = tc.env[this.id].body
    return expr.doTest(tc, value)
  }
}

export class Call extends Expression {
  constructor (id, args = []) {
    super()
    this.id = id
    this.args = args
    this.func = undefined
  }

  doEval (tc) {
    let func = tc.env[this.id].body
    return func.doEval(tc, this.args)
  }

  doTest (tc, value) {
    let func = tc.env[this.id].body
    return func.doTest(tc, value, this.args)
  }
}

export class Function_ extends Expression {
  constructor (params, body) {
    super()
    this.params = params
    this.body = body
  }

  doEval (tc) {
    return this
  }

  doTest (tc, value, args) {
    this.source.doEval(tc, value)
  }
}

export class Custom extends Expression {
  constructor (doEval, doTest) {
    super()
    this.doEval = doEval
    this.doTest = doTest
  }
}

export class Object_ extends Expression {
  constructor (propertyList) {
    super()
    this.propertyList = propertyList
  }

  doTest (tc, value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false
    }
    for (let prop of this.propertyList) {
      if (!prop.doTest(tc, value)) return false
    }
    return true
  }
}

export class Array_ extends Expression {
  constructor (items) {
    super()
    this.items = items
  }

  doTest (tc, value) {
    if (!Array.isArray(value)) {
      return false
    }
    let vidx = 0
    for (let item of this.items) {
      let o = 0
      while (o < item.maxCount &&
        vidx < value.length && item.doTest(tc, value[vidx++])
      ) {
        o++
      }
      if (o < item.minCount) {
        return false
      }
    }
    return true
  }
}

// helpers

export class Property extends Expression {
  constructor (name, value, minCount = 1, maxCount = Infinity) {
    super()
    this.name = name
    this.value = value
    this.minCount = minCount
    this.maxCount = maxCount
  }

  doTest (tc, value) {
    // this is checked in the object pattern
    // if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    //   return false
    // }
    let occurs = 0
    if (tc.tr.matchSet) {
      for (let name in value) {
        if (this.name.doTest(tc, name)) {
          tc.tr.matchSet[name] = true
          let savedMatchSet = tc.tr.matchSet
          tc.tr.matchSet = null
          const match = this.value.doTest(tc, value[name])
          tc.tr.matchSet = savedMatchSet
          if (match) {
            occurs++
          } else {
            return false
          }
        }
      }
    } else {
      for (let name in value) {
        if (this.name.doTest(tc, name)) {
          if (this.value.doTest(tc, value[name])) {
            occurs++
          } else {
            return false
          }
        }
      }
    }
    if (occurs < this.minCount || occurs > this.maxCount) return false
    return true
  }
}

export class ListItem extends Expression {
  constructor (value) {
    super()
    this.value = value
  }
}

// leaf nodes

export class Literal extends Expression {
  constructor (value) {
    super()
    this.value = value
  }

  doEval (tc) {
    return this.value
  }

  doTest (tc, value) {
    return this.value === value
  }
}

export class RegExp_ extends Expression {
  constructor (body, flags) {
    super()
    this.body = body
    this.flags = flags
  }

  static fromRegExp (rgx) {
    let obj = new RegExp_()
    obj.regexp = rgx
    return obj
  }

  doEval (tc) {
    return this.regexp
  }

  doTest (tc, value) {
    return this.regexp.test(value)
  }
}

export class This extends Expression {
  doEval (tc) {
    return tc.this
  }
}
