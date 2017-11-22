import { RuntimeContext } from './runtime'
import { TransactionalMap } from './map'
import { importValue } from './import'
import { RuntimeError } from './diag'

export class Module {
  constructor (declList) {
    this.declList = declList
    this.exports = {}
    this.defaultExport = undefined
  }

  test (value, {
    messages,
    runtime = new RuntimeContext(this.env, { messages })
  } = {}) {
    if (!this.defaultExport) {
      throw new Error(`attempt to validate against the default export but it doesn't exist`)
    }
    let result = this.defaultExport.eval(runtime).test(runtime, value)
    return result && !runtime.diag.hasError
  }
}

export class ImportDeclaration {
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

export class ExportDeclaration {
  constructor (body) {
    this.body = body
  }
}

export class ConstDeclaration {
  constructor (id, body) {
    this.id = id
    this.body = body
  }

  eval (rc) {
    if (!('value' in this)) {
      if (this.busy) {
        throw new RuntimeError('Circular reference detected', this, 'CIRCULAR_REF')
      }
      this.busy = true
      const savedEnv = rc.env
      try {
        if (this.env) rc.env = this.env
        this.value = this.body.eval(rc)
      } catch (e) {
        if (e instanceof RuntimeError && e.code === 'CIRCULAR_REF' && e.ref) {
          // todo: remove this when stack traces are implemented
          rc.diag.error(`circular reference detected while evaluating const '${this.id}'`)
          if (e.ref === this) e.ref = null
        }
        throw e
      } finally {
        this.busy = false
        rc.env = savedEnv
      }
    }
    return this.value
  }

  test (rc, value) {
    return this.body.test(rc, value)
  }
}

// expression

export class Expression {
  // constructor () {
  //   if (new.target === Expression) {
  //     throw new Error(`can't instantiate abstract class`)
  //   }
  // }

  eval (rc) {
    return this
  }

  test (rc, value) {
    throw new RuntimeError(`${this.getName()} can't be used as pattern`,
      this, 'PATTERN_EXPECTED')
  }

  call (rc, args) {
    throw new RuntimeError(`${this.getName()} can't be called`,
      this, 'NOT_CALLABLE')
  }

  getChild (rc, id) {
    throw new RuntimeError(`property ${id} is not found on ${this.getName()}`,
      this, 'PROPERTY_NOT_FOUND')
  }

  getNativeValue (rc) {
    throw new RuntimeError(`${this.getName()} can't be passed to a native pattern`,
      this, 'NO_NATIVE_VALUE')
  }

  getName () {
    return this.alias || (this.constructor && this.constructor.name) || 'expression'
  }
}

export class ImportExpression extends Expression {
  constructor (exports, exportId, targetName) {
    super()
    this.exports = exports
    this.exportId = exportId
    this.targetName = targetName
  }

  eval (rc) {
    if (!(this.exportId in this.exports)) {
      throw new RuntimeError(`${this.exportId} is not exported by module ` +
      `'${this.targetName}'`, this, 'NOT_EXPORTED')
    }
    return importValue(this.exports[this.exportId]).eval(rc)
  }
}

export class LocalEnvironment extends Expression {
  constructor (declList, body) {
    super()
    this.declList = declList
    this.body = body
  }

  eval (rc) {
    let savedEnv = rc.env
    if (this.env) {
      rc.env = this.env
    } else {
      rc.env = Object.assign(Object.create(rc.env), this.staticEnv)
    }
    let result = this.body.eval(rc)
    rc.env = savedEnv
    return result
  }
}

export class OrPattern extends Expression {
  constructor (items) {
    super()
    this.items = items
  }

  test (rc, value) {
    let result = false
    for (let item of this.items) {
      rc.begin()
      if (item.eval(rc).test(rc, value)) {
        rc.commit()
        result = true
        // todo: continue iteration only if unique or closed is in effect
      } else {
        rc.rollback()
      }
    }
    return result
  }
}

export class AndPattern extends Expression {
  constructor (items) {
    super()
    this.items = items
  }

  test (rc, value) {
    for (let item of this.items) {
      if (!item.eval(rc).test(rc, value)) {
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

  test (rc, value) {
    rc.begin()
    var result = !this.expr.eval(rc).test(rc, value)
    rc.rollback()
    return result
  }
}

export class Member extends Expression {
  constructor (expr, id) {
    super()
    this.expr = expr
    this.id = id
  }

  eval (rc) {
    return this.expr.eval(rc).getChild(rc, this.id)
  }
}

export class Reference extends Expression {
  constructor (id) {
    super()
    this.id = id
  }

  eval (rc) {
    const target = rc.env[this.id]
    if (!target) {
      throw new RuntimeError(`undefined identifier '${this.id}'`,
        this, 'UNDEFINED_ID')
    }
    return target.eval(rc)
  }
}

export class Call extends Expression {
  constructor (expr, args = []) {
    super()
    this.expr = expr
    this.args = args
  }

  eval (rc) {
    let func = this.expr.eval(rc)
    return func.call(rc, this.args)
  }
}

export class Function_ extends Expression {
  constructor (params, body) {
    super()
    this.params = params
    this.body = body
  }

  call (rc, args) {

  }
}

export class NativePattern extends Expression {
  constructor (fn) {
    super()
    this.fn = fn
  }

  call (rc, args) {
    let fn = this.fn
    args = args.map(arg => arg.eval(rc).getNativeValue(rc))
    return new (class extends Expression {
      test (rc, value) {
        return fn.call(rc, value, ...args)
      }
    })()
  }

  test (rc, value) {
    return this.fn.call(rc, value)
  }
}

export class ObjectPattern extends Expression {
  constructor (propertyList) {
    super()
    this.propertyList = propertyList
  }

  test (rc, value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false
    }
    rc.pathStack.push('')
    for (let prop of this.propertyList) {
      if (!prop.test(rc, value)) return false
    }
    rc.pathStack.pop()
    return true
  }
}

export class ArrayPattern extends Expression {
  constructor (items, minCount = 1, maxCount = 1) {
    super()
    this.items = items
    this.minCount = minCount
    this.maxCount = maxCount
  }

  test (rc, value) {
    if (!Array.isArray(value)) {
      return false
    }
    let prevArrayMatchLimit = rc.tr.arrayMatchLimit
    let idx = 0
    let rep = 0
    rc.pathStack.push(0)
    while (rep < this.maxCount) {
      let baseIdx = idx
      let match
      [match, idx] = this.testItemsAtIndex(rc, value, idx)
      if (!match) break
      rep++
      if (idx === baseIdx) break
    }
    rc.pathStack.pop()
    if (rep < this.minCount) {
      return false
    }
    rc.tr.arrayMatchLimit = Math.max(prevArrayMatchLimit, idx)
    return true
  }

  testItemsAtIndex (rc, value, idx) {
    let baseIdx = idx
    for (let item of this.items) {
      let match
      [match, idx] = item.testAtIndex(rc, value, idx)
      if (!match) {
        rc.pathStack.pop()
        return [false, baseIdx]
      }
    }
    return [true, idx]
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

  test (rc, value) {
    // this is checked in the object pattern
    // if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    //   return false
    // }
    let occurs = 0
    if (rc.tr.matchSet) {
      for (let name in value) {
        rc.pathStack[rc.pathStack.length - 1] = name
        if (this.name.eval(rc).test(rc, name)) {
          rc.tr.matchSet[name] = true
          let savedMatchSet = rc.tr.matchSet
          rc.tr.matchSet = null
          const match = this.value.eval(rc).test(rc, value[name])
          rc.tr.matchSet = savedMatchSet
          if (match) {
            occurs++
          } else {
            return false
          }
        }
      }
    } else {
      for (let name in value) {
        rc.pathStack[rc.pathStack.length - 1] = name
        if (this.name.eval(rc).test(rc, name)) {
          if (this.value.eval(rc).test(rc, value[name])) {
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

  testAtIndex (rc, value, idx) {
    let occurs = 0
    while (occurs < this.maxCount &&
      idx < value.length && this.value.eval(rc).test(rc, value[idx])
    ) {
      idx++
      occurs++
      rc.pathStack[rc.pathStack.size - 1] = idx
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

  getChild (rc, id) {
    if (id in this.value) {
      return this.value[id]
    } else {
      return super.getChild(rc, id)
    }
  }

  getNativeValue (rc) {
    return this.value
  }

  test (rc, value) {
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

  getNativeValue (rc) {
    return this.regexp
  }

  test (rc, value) {
    return this.regexp.test(value)
  }
}

export class This extends Expression {
  eval (rc) {
    return rc.this
  }
}

export class SetConstructor extends Expression {
  getNativeValue (rc) {
    if (!this.map) {
      this.map = new TransactionalMap(rc)
    }
    return this.map
  }

  getChild (rc, id) {
    switch (id) {
      // case 'size': return new Literal(this.getNativeValue(rc).size())
      default: return super.getChild(rc, id)
    }
  }
}
