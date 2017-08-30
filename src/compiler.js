import { dirname, join } from 'path'
import { parse } from './parser'
import * as model from './model'
import * as builtin from './builtin'

const builtins = compileBuiltins(builtin)

/**
 * Compiles a source string into a declaration module.
 * @param {string} str - source code
 * @param {object} opts - provides resources and informations
 */
export function compile (str, opts = {}) {
  const module_ = parse(str, {
    error: opts.error
  })
  if (!module_) return null
  module_.decls = Object.assign({}, builtins)
  const cc = new CompilerContext(module_, {
    error: opts.error || function () {},
    importPath: dirname(opts.filename)
  })
  build(module_, cc)
  if (cc.errors) return null
  resolve(module_, cc)
  if (cc.errors) return null
  return module_
}

class CompilerContext {
  constructor (module_, opts) {
    this.module = module_
    this.opts = opts
    this.errors = 0
    this.exportCount = 0
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
        this.exportCount++
      }
    } else if (id in this.currentBlock.decls) {
      this.error(`${id}: duplicate identifier`)
    } else {
      this.currentBlock.decls[id] = expr
      if (exported) {
        this.module.exports[id] = expr
        this.exportCount++
      }
    }
  }

  error (msg) {
    this.errors++
    this.opts.error(msg)
  }
}

/**
 * A compilation step that builds blocks, namespaces and declarations.
 */
function build (node, cc) {
  let method = builder[node.constructor.name]
  if (method) method(node, cc)
}
const builder = {

  Module (node, cc) {
    cc.enter(node)
    for (let import_ of node.importList) {
      build(import_, cc)
    }
    for (let decl of node.declList) {
      build(decl, cc)
    }
    cc.leave()
    if (!cc.exportCount) {
      cc.error(`module should export at least one declaration`)
    }
  },

  Import (node, cc) {
    if (!cc.opts.importPath) {
      cc.error(`using import requires the 'importPath' option`)
      return
    }
    const modulePath = join(cc.opts.importPath, node.moduleSpec)
    let donor
    try {
      donor = require(modulePath)
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        cc.error(e.message)
        return
      }
    }
    for (let item of node.importList) {
      if (item.originalId in donor) {
        cc.declare(item.localId,
          compileImport(donor[item.originalId],
            item.originalId,
            item.localId,
            node.moduleSpec,
            cc.error.bind(cc)
          )
        )
      } else {
        cc.error(`${item.originalId}: identifier not defined in module ` +
          `'${node.moduleSpec}'`)
      }
    }
  },

  Declaration (node, cc) {
    cc.declare(node.id, node, node.exported)
    build(node.body, cc)
  },

  LogicalOr (node, cc) {
    node.items.forEach(i => build(i, cc))
  },

  LogicalAnd (node, cc) {
    node.items.forEach(i => build(i, cc))
  },

  Chain (node, cc) {
    node.items.forEach(i => build(i, cc))
  },

  Call (node, cc) {
    node.args.forEach(i => build(i, cc))
  },

  Object_ (node, cc) {
    node.propertyList.forEach(i => build(i, cc))
  },

  Property (node, cc) {
    build(node.name, cc)
    build(node.value, cc)
  },

  RegExp_ (node, cc) {
    if (node.flags && node.flags !== 'i') {
      cc.error(`'${node.flags}': illegal regexp flag (only 'i' is allowed)`)
      return
    }
    try {
      node.regexp = new RegExp(node.body, node.flags)
    } catch (e) {
      cc.error(e.message)
    }
  }
}

/**
 * A compilation step that binds names to their declarations.
 */
function resolve (node, cc) {
  let method = resolver[node.constructor.name]
  if (method) method(node, cc)
}
const resolver = {

  Module (node, cc) {
    cc.enter(node)
    for (let decl of node.declList) {
      resolve(decl, cc)
    }
    cc.leave()
  },

  Declaration (node, cc) {
    resolve(node.body, cc)
    return node
  },

  LogicalOr (node, cc) {
    node.items.forEach(i => resolve(i, cc))
  },

  LogicalAnd (node, cc) {
    node.items.forEach(i => resolve(i, cc))
  },

  Chain (node, cc) {
    node.items.forEach(i => resolve(i, cc))
  },

  Reference (node, cc) {
    node.pattern = cc.lookup(node.id)
  },

  Call (node, cc) {
    node.func = cc.lookup(node.id)
    node.args.forEach(i => resolve(i, cc))
  },

  Object_ (node, cc) {
    node.propertyList.forEach(i => resolve(i, cc))
  },

  Array_ (node, cc) {
    node.items.forEach(i => resolve(i, cc))
  },

  Property (node, cc) {
    resolve(node.name, cc)
    resolve(node.value, cc)
  }
}

/**
 * Creates a declaration from an imported value.
 * @param {*} value value to be imported
 * @param {string} originalId foreign id of the imported element
 * @param {string} localId local id of the imported element
 * @param {string} moduleSpec foreign module name for diagnostics
 * @param {function} error emits diagnostic messages
 */
function compileImport (value, originalId, localId, moduleSpec, error) {
  switch (typeof value) {
    case 'function':
      return new model.Declaration(localId, new model.Custom(null, value))
    case 'object': {
      if (typeof value.eval === 'function') {
        var eval_ = value.eval.bind(value)
      }
      if (typeof value.test === 'function') {
        var test = value.test.bind(value)
      }
      if (!eval_ && !test) {
        error(`${originalId} imported from '${moduleSpec}' must ` +
          `implement 'eval' or 'test'`)
        return null
      }
      return new model.Declaration(localId, new model.Custom(eval_, test))
    }
    case 'number':
    case 'string':
    case 'null':
    case 'boolean':
      return new model.Declaration(localId, new model.Literal(value))
    default:
      error(`${originalId} imported from '${moduleSpec}' has` +
        `illegal type '${typeof value}'`)
      return null
  }
}

function compileBuiltins (builtin) {
  let decls = {}
  for (let b in builtin) {
    decls[b] = compileImport(builtin[b], b, './builtin', _ => null)
  }
  return decls
}
