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
    this.envStack = []
    this.currentBlock = undefined
  }

  enter (block) {
    this.envStack.push(this.currentBlock)
    this.currentBlock = block
  }

  leave () {
    this.currentBlock = this.envStack.pop()
  }

  lookup (id) {
    let decl = this.currentBlock.decls[id]
    if (!decl) {
      this.error(`${id}: undeclared identifier`)
    } else {
      return decl
    }
  }

  declare (id, expr, exported) {
    if (!id) {
      if (this.module.defaultExport) {
        this.error(`duplicate default export`)
      } else {
        this.module.defaultExport = expr
      }
    } else if (id in this.currentBlock.decls) {
      this.error(`${id}: duplicate identifier`)
    } else {
      this.currentBlock.decls[id] = expr
      if (exported) {
        this.module.exports[id] = expr
      }
    }
  }

  buildScope (node) {
    let method = buildScope[node.constructor.name]
    if (method) method.call(node, this)
  }

  bind (node) {
    let method = bind[node.constructor.name]
    if (method) {
      return method.call(node, this)
    } else {
      return node
    }
  }

  compileImportExpression (expr) {
    // todo: check type of import and handle accordingly
    return expr
  }

  error (msg) {
    this.errors++
    this.opts.error && this.opts.error(msg)
  }
}

const buildScope = {

  Module (cc) {
    cc.enter(this.decls)
    for (let import_ of this.importList) {
      cc.buildScope(import_)
    }
    for (let decl of this.declList) {
      cc.buildScope(decl)
    }
    cc.leave()
  },

  Import (cc) {
    const module = require(this.moduleSpec)
    for (let item of this.importList) {
      if (item.origId in module) {
        cc.declare(item.localId, cc.compileImportExpression(module[item.origId]))
      } else {
        cc.error(`${item.origId}: identifier not defined in module ` +
          `'${this.moduleSpec}'`)
      }
    }
  },

  Const (cc) {
    cc.declare(this.id, this, this.exported)
    cc.buildScope(this.value)
  },

  LogicalOr (cc) {
    this.items.forEach(i => cc.buildScope(i))
  },

  LogicalAnd (cc) {
    this.items.forEach(i => cc.buildScope(i))
  },

  ChainedCall (cc) {
    this.calls.forEach(i => cc.buildScope(i))
  },

  Call (cc) {
    this.args.forEach(i => cc.buildScope(i))
  }
}

const bind = {

  Module (cc) {
    cc.enter(this.decls)
    for (let import_ of this.importList) {
      cc.buildScope(import_)
    }
    for (let decl of this.declList) {
      decl.buildScope(cc)
    }
    cc.leave()
    return this
  },

  Import (cc) {
    const module = require(this.moduleSpec)
    for (let item of this.importList) {
      if (item.origId in module) {
        cc.declare(item.localId, cc.compileImportExpression(module[item.origId]))
      } else {
        cc.error(`${item.origId}: identifier not defined in module ` +
          `'${this.moduleSpec}'`)
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
  },

  Call (cc) {
    this.calls = this.calls.map(i => cc.compile(i))
    return this
  }
}
