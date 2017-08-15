import { parse } from './parser'

export function compile (str, opts = {}) {
  const module = parse(str)
  if (!module) return null
  const cc = new CompilerContext(module, opts)
  cc.compile(module)
  return cc.errors === 0 ? module : null
}

class CompilerContext {
  constructor (module, opts) {
    this.module = module
    this.opts = opts
    this.errors = 0
  }

  compile (node) {
    return methods[node.constructor.name](this)
  }

  compileImportExpression (expr) {
    // todo: check type of import and handle accordingly
    return expr
  }

  error (msg) {
    this.errors++
    this.opts.error && this.opts.error(msg)
  }

  declare (id, expr, exported) {
    if (id in this.module.decls) {
      this.error(`${id}: duplicate identifier`)
    } else {
      this.module.decls[id] = expr
      if (exported) {
        this.module.exports[id] = expr
      }
    }
  }
}

const methods = {

  Module (cc) {
    for (let import_ of this.importList) {
      import_.compile(cc)
    }
    for (let decl of this.declList) {
      decl.compile(cc)
    }
    return this
  },

  Import (cc) {
    const module = require(this.moduleSpec)
    for (let item of this.importList) {
      if (item.origId in module) {
        cc.declare(item.localId, cc.compileImportExpression(module[item.origId]))
      } else {
        cc.error(`${item.origId}: identifier not defined in module '${this.moduleSpec}`)
      }
    }
  },

  Const (cc) {
    cc.declare(this.id, cc.compile(this.value), this.exported)
  },

  LogicalOr (cc) {
    this.items = this.items.map(i => cc.compile(i))
    return this
  },

  LogicalAnd (cc) {
    this.items = this.items.map(i => cc.compile(i))
    return this
  },

  ChainedCall (cc) {
    this.calls = this.calls.map(i => cc.compile(i))
    return this
  }
}
