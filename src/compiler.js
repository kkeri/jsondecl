import { parse } from './parser'
import { dirname, join } from 'path'

export function compile (str, opts = {}) {
  const module = parse(str, {
    error: opts.error
  })
  if (!module) return null
  const cc = new CompilerContext(module, {
    error: opts.error || function () {},
    importPath: dirname(opts.filename)
  })
  cc.buildBlock(module)
  if (cc.errors) return null
  cc.bind(module)
  if (cc.errors) return null
  return module
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
    if (decl) {
      return decl.body
    } else {
      this.error(`${id}: undeclared identifier`)
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

  buildBlock (node) {
    let method = buildBlock[node.constructor.name]
    if (method) method.call(node, this)
  }

  bind (node) {
    let method = bind[node.constructor.name]
    if (method) method.call(node, this)
  }

  compileImportExpression (expr) {
    // todo: check type of import and handle accordingly
    return expr
  }

  error (msg) {
    this.errors++
    this.opts.error(msg)
  }
}

const buildBlock = {

  Module (cc) {
    cc.enter(this)
    for (let import_ of this.importList) {
      cc.buildBlock(import_)
    }
    for (let decl of this.declList) {
      cc.buildBlock(decl)
    }
    cc.leave()
  },

  Import (cc) {
    if (!cc.opts.importPath) {
      cc.error(`using import requires the 'importPath' option`)
      return
    }
    const donor = require(join(cc.opts.importPath, this.moduleSpec))
    for (let item of this.importList) {
      if (item.originalId in donor) {
        cc.declare(item.localId,
          cc.compileImportExpression(donor[item.originalId]))
      } else {
        cc.error(`${item.originalId}: identifier not defined in module ` +
          `'${this.moduleSpec}'`)
      }
    }
  },

  Const (cc) {
    cc.declare(this.id, this, this.exported)
    cc.buildBlock(this.body)
  },

  LogicalOr (cc) {
    this.items.forEach(i => cc.buildBlock(i))
  },

  LogicalAnd (cc) {
    this.items.forEach(i => cc.buildBlock(i))
  },

  ChainedCall (cc) {
    this.calls.forEach(i => cc.buildBlock(i))
  },

  Call (cc) {
    this.args.forEach(i => cc.buildBlock(i))
  }
}

const bind = {

  Module (cc) {
    cc.enter(this)
    for (let decl of this.declList) {
      cc.bind(decl)
    }
    cc.leave()
  },

  Const (cc) {
    cc.bind(this.body)
    return this
  },

  LogicalOr (cc) {
    this.items.forEach(i => cc.bind(i))
  },

  LogicalAnd (cc) {
    this.items.forEach(i => cc.bind(i))
  },

  ChainedCall (cc) {
    this.calls.forEach(i => cc.bind(i))
  },

  Call (cc) {
    this.func = cc.lookup(this.id)
    this.args.forEach(i => cc.bind(i))
  },

  Object_ (cc) {
    this.properties.forEach(i => cc.bind(i))
  },

  Array_ (cc) {
    this.items.forEach(i => cc.bind(i))
  },

  Property (cc) {
    cc.bind(this.name)
    cc.bind(this.value)
  }
}
