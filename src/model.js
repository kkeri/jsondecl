import { TestContext } from './context'
import { TransactionalMap } from './map'

export class Module {
  constructor (declList) {
    this.declList = declList
    this.exports = {}
    this.defaultExport = undefined
  }

  test (value, id = '') {
    const tc = new TestContext(this.env)
    if (id === '') {
      if (!this.defaultExport) {
        throw new Error('attempt to test against the default declaration but it is not declared')
      }
      return this.defaultExport.doEval(tc).doTest(tc, value)
    } else {
      if (!(id in this.exports)) {
        throw new Error(`attempt to test against '${id}' but it is not declared`)
      }
      return this.exports[id].doTest(tc, value)
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

export class Export {
  constructor (body) {
    this.body = body
  }
}

export class Const {
  constructor (id, body) {
    this.id = id
    this.body = body
  }

  test (value, args) {
    if (!this.env) {
      throw new Error(`a declaration in a parametric environment can't ` +
      `be tested independently`)
    }
    const tc = new TestContext(this.env)
    return this.doTest(tc, value, args)
  }

  doEval (tc) {
    if (!('value' in this)) {
      this.value = this.expr.doEval(tc)
    }
    return this.value
  }

  doTest (tc, value, args) {
    return this.expr.doTest(tc, value, args)
  }
}

// expression

export class Expression {
  // constructor () {
  //   if (new.target === Expression) {
  //     throw new Error(`can't instantiate abstract class`)
  //   }
  // }

  doEval (tc) {
    return this
  }

  doTest (tc, value) {
    tc.error(`the expression can't be used as pattern`)
    return false
  }

  call (tc, args) {
    tc.error(`the expression can't be called`)
    return this
  }

  getChild (tc, id) {
    tc.error(`property ${id} is not found`)
    return this
  }

  getNativeValue (tc) {
    tc.error(`the expression can't be passed to a native pattern`)
    return null
  }
}

export class LocalEnvironment extends Expression {
  constructor (declList, body) {
    super()
    this.declList = declList
    this.body = body
  }

  doEval (tc) {
    let savedEnv = tc.env
    if (this.env) {
      tc.env = this.env
    } else {
      tc.env = Object.assign(Object.create(tc.env), this.staticEnv)
    }
    let result = this.body.doEval(tc)
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
      if (item.doEval(tc).doTest(tc, value)) {
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
      if (!item.doEval(tc).doTest(tc, value)) {
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
    var result = !this.expr.doEval(tc).doTest(tc, value)
    tc.rollback()
    return result
  }
}

export class Member extends Expression {
  constructor (expr, id) {
    super()
    this.expr = expr
    this.id = id
  }

  doEval (tc) {
    return this.expr.doEval(tc).getChild(tc, this.id)
  }
}

export class Reference extends Expression {
  constructor (id) {
    super()
    this.id = id
  }

  doEval (tc) {
    return tc.env[this.id].doEval(tc)
  }
}

export class Call extends Expression {
  constructor (expr, args = []) {
    super()
    this.expr = expr
    this.args = args
  }

  doEval (tc) {
    let func = this.expr.doEval(tc)
    return func.call(tc, this.args)
  }
}

export class Function_ extends Expression {
  constructor (params, body) {
    super()
    this.params = params
    this.body = body
  }

  call (tc, args) {

  }
}

export class NativeMacro extends Expression {
  constructor (opts) {
    super()
    if (typeof opts.doEval === 'function') this.doEval = opts.doEval
    if (typeof opts.doTest === 'function') this.doTest = opts.doTest
    if (typeof opts.call === 'function') this.call = opts.call
    if (typeof opts.getNativeValue === 'function') this.getNativeValue = opts.getNativeValue
  }
}

export class NativePattern extends Expression {
  constructor (fn) {
    super()
    this.fn = fn
  }

  call (tc, args) {
    args = args.map(arg => arg.doEval(tc).getNativeValue(tc))
    return new NativeMacro({
      doTest: (tc, value) => this.fn.call(tc, value, ...args)
    })
  }

  doTest (tc, value) {
    return this.fn(value)
  }
}

export class ObjectPattern extends Expression {
  constructor (propertyList) {
    super()
    this.propertyList = propertyList
  }

  doTest (tc, value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false
    }
    tc.pathStack.push('')
    for (let prop of this.propertyList) {
      if (!prop.doTest(tc, value)) return false
    }
    tc.pathStack.pop()
    return true
  }
}

export class ArrayPattern extends Expression {
  constructor (items) {
    super()
    this.items = items
  }

  doTest (tc, value) {
    if (!Array.isArray(value)) {
      return false
    }
    let prevArrayMatchLimit = tc.tr.arrayMatchLimit
    let idx = 0
    tc.pathStack.push(0)
    for (let item of this.items) {
      let match
      [match, idx] = item.testAtIndex(tc, value, idx)
      if (!match) {
        tc.pathStack.pop()
        return false
      }
    }
    tc.pathStack.pop()
    tc.tr.arrayMatchLimit = Math.max(prevArrayMatchLimit, idx)
    return true
  }
}

// helpers

export class PropertyPattern extends Expression {
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
        tc.pathStack[tc.pathStack.length - 1] = name
        if (this.name.doEval(tc).doTest(tc, name)) {
          tc.tr.matchSet[name] = true
          let savedMatchSet = tc.tr.matchSet
          tc.tr.matchSet = null
          const match = this.value.doEval(tc).doTest(tc, value[name])
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
        tc.pathStack[tc.pathStack.length - 1] = name
        if (this.name.doEval(tc).doTest(tc, name)) {
          if (this.value.doEval(tc).doTest(tc, value[name])) {
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

export class ArrayItemPattern extends Expression {
  constructor (value, minCount = 1, maxCount = 1) {
    super()
    this.value = value
    this.minCount = minCount
    this.maxCount = maxCount
  }

  testAtIndex (tc, value, idx) {
    let occurs = 0
    while (occurs < this.maxCount &&
      idx < value.length && this.value.doEval(tc).doTest(tc, value[idx])
    ) {
      idx++
      occurs++
      tc.pathStack[tc.pathStack.size - 1] = idx
    }
    return [occurs >= this.minCount, idx]
  }
}

// leaf nodes

export class Literal extends Expression {
  constructor (value) {
    super()
    this.value = value
  }

  getNativeValue (tc) {
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
    this.regexp = undefined
  }

  static fromRegExp (rgx) {
    let obj = new RegExp_()
    obj.regexp = rgx
    return obj
  }

  getNativeValue (tc) {
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

export class SetConstructor extends Expression {
  getNativeValue (tc) {
    if (!this.map) {
      this.map = new TransactionalMap(tc)
    }
    return this.map
  }

  getChild (tc, id) {
    switch (id) {
      case 'size': return new Literal(this.getNativeValue(tc).size())
      default: return super.getChild(tc, id)
    }
  }
}
