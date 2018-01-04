import { RuntimeContext } from './runtime'
import { TransactionalMap } from './map'
import { importValue } from './import'
import { RuntimeError } from './diag'

export class Module {
  constructor (declList) {
    this.declList = declList
    this.exports = {}
  }

  match (value, {
    messages,
    runtime = new RuntimeContext(this.env, { messages })
  } = {}) {
    if (!this.exports.default) {
      throw new Error(`attempt to validate against the default export but it doesn't exist`)
    }
    let result = this.exports.default.eval(runtime).match(runtime, value)
    return result && !runtime.tr.diag.hasError
  }
}

export class ImportDeclaration {
  constructor (moduleSpec, importList) {
    this.moduleSpec = moduleSpec
    this.importList = importList
  }
}

export class ImportSpecifier {
  constructor (exportId, localId) {
    this.exportId = exportId
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
}

// expression

export class Expression {
  eval (rc) {
    return this
  }

  match (rc, value) {
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

export class DeclarationExpression extends Expression {
  constructor (id, expr, env) {
    super()
    this.id = id
    this.expr = expr
    this.env = env
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
        this.value = this.expr.eval(rc)
      } catch (e) {
        if (e instanceof RuntimeError && e.code === 'CIRCULAR_REF' && e.ref) {
          // todo: remove this when stack traces are implemented
          rc.error(`circular reference detected while evaluating '${this.id}'`)
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

  match (rc, value) {
    return this.eval(rc).match(rc, value)
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
    try {
      return this.body.eval(rc)
    } finally {
      rc.env = savedEnv
    }
  }
}

export class OrPattern extends Expression {
  constructor (items) {
    super()
    this.items = items
  }

  match (rc, value) {
    rc.begin()
    let result = false
    for (let item of this.items) {
      rc.begin()
      if (item.eval(rc).match(rc, value)) {
        rc.succeed()
        result = true
        // todo: continue iteration only if unique or closed is in effect
      } else {
        rc.fail()
      }
    }
    if (result) {
      rc.succeed()
    } else {
      rc.fail()
    }
    return result
  }
}

export class AndPattern extends Expression {
  constructor (items) {
    super()
    this.items = items
  }

  match (rc, value) {
    for (let item of this.items) {
      if (!item.eval(rc).match(rc, value)) {
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

  match (rc, value) {
    rc.begin()
    var result = !this.expr.eval(rc).match(rc, value)
    rc.rollback()
    if (!result) {
      rc.error(this.expr.getName() + ' matches when it must not match',
        this.expr)
    }
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
      match (rc, value) {
        return fn.call(rc, value, ...args)
      }
    })()
  }

  match (rc, value) {
    return this.fn.call(rc, value)
  }
}

export class ObjectPattern extends Expression {
  constructor (expr) {
    super()
    this.expr = expr
  }

  match (rc, value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      rc.error(`object expected`, this)
      return false
    }
    rc.pathStack.push(undefined)
    try {
      return this.expr.eval(rc).match(rc, value)
    } finally {
      rc.pathStack.pop()
    }
  }
}

export class PropertyPattern extends Expression {
  constructor (name, value, minCount = 1, maxCount = Infinity) {
    super()
    this.name = name
    this.value = value
    this.minCount = minCount
    this.maxCount = maxCount
  }

  match (rc, value) {
    let occurs = 0
    // if (rc.tr.matchSet) {
    //   for (let name in value) {
    //     rc.pathStack[rc.pathStack.length - 1] = name
    //     rc.begin()
    //     const matchName = this.name.eval(rc).match(rc, name)
    //     rc.rollback()
    //     if (matchName) {
    //       rc.tr.matchSet[name] = true
    //       let savedMatchSet = rc.tr.matchSet
    //       rc.tr.matchSet = null
    //       const match = this.value.eval(rc).match(rc, value[name])
    //       rc.tr.matchSet = savedMatchSet
    //       if (match) {
    //         occurs++
    //       } else {
    //         rc.error(`property name '${name}' matches but its value doesn't`,
    //           this)
    //         return false
    //       }
    //     }
    //   }
    // } else {
    for (let name in value) {
      rc.pathStack[rc.pathStack.length - 1] = name
      rc.begin()
      const matchName = this.name.eval(rc).match(rc, name)
      rc.rollback()
      if (matchName) {
        let match
        if (rc.tr.matchSet) {
          rc.tr.matchSet[name] = true
          let savedMatchSet = rc.tr.matchSet
          rc.tr.matchSet = null
          match = this.value.eval(rc).match(rc, value[name])
          rc.tr.matchSet = savedMatchSet
        } else {
          match = this.value.eval(rc).match(rc, value[name])
        }
        if (match) {
          occurs++
        } else {
          rc.error(`property name '${name}' matches but its value doesn't`, this)
          return false
        }
      }
    }
    // }
    if (!occurs && this.minCount > 0) {
      rc.error(`property pattern doesn't match`, this)
      return false
    }
    if (occurs < this.minCount) {
      rc.error(`property pattern matches too few times (${occurs} instead of ${this.minCount})`,
        this)
      return false
    }
    if (occurs > this.maxCount) {
      rc.error(`property pattern matches too many times (${occurs} instead of ${this.maxCount})`,
      this)
      return false
    }
    return true
  }
}

export class ArrayPattern extends Expression {
  constructor (expr) {
    super()
    this.expr = expr
  }

  match (rc, value) {
    if (!Array.isArray(value)) {
      rc.error(`array expected`, this)
      return false
    }
    const prevArrayIdx = rc.tr.nextArrayIdx
    rc.tr.nextArrayIdx = 0
    rc.pathStack.push(undefined)
    try {
      return this.expr.eval(rc).match(rc, value)
    } finally {
      rc.pathStack.pop()
      rc.tr.nextArrayIdx = Math.max(prevArrayIdx, rc.tr.nextArrayIdx)
    }
  }
}

export class RepetitionPattern extends Expression {
  constructor (expr, minCount = 1, maxCount = 1) {
    super()
    this.expr = expr
    this.minCount = minCount
    this.maxCount = maxCount
  }

  match (rc, value) {
    let rep = 0
    while (rep < this.maxCount) {
      rc.begin()
      let base = rc.tr.nextArrayIdx
      if (this.expr.eval(rc).match(rc, value)) {
        rep++
        let delta = rc.tr.nextArrayIdx - base
        rc.succeed()
        if (!delta) break
      } else {
        rc.rollback()
        break
      }
    }
    if (!rep && this.minCount) {
      rc.error(`pattern doesn't match`, this)
      return false
    } else if (rep < this.minCount) {
      rc.error(`pattern matches too few times (${rep} instead of ${this.minCount})`, this)
      return false
    }
    return true
  }
}

export class ArrayItemPattern extends Expression {
  constructor (expr) {
    super()
    this.expr = expr
  }

  match (rc, value) {
    let base = rc.tr.nextArrayIdx
    if (base >= value.length) return false
    rc.pathStack[rc.pathStack.length - 1] = base
    if (this.expr.eval(rc).match(rc, value[base])) {
      rc.tr.nextArrayIdx = base + 1
      return true
    } else {
      return false
    }
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

  match (rc, value) {
    if (this.value === value) {
      return true
    } else {
      rc.error(`value is not equal to ${this.value}`, this)
      return false
    }
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

  match (rc, value) {
    if (this.regexp.test(value)) {
      return true
    } else {
      rc.error(`value doesn't match ${this.regexp}`, this)
      return false
    }
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
