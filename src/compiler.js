import { readFileSync } from 'fs'
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
  const cc = new CompilerContext(module_, {
    error: opts.error || function () {},
    importPath: opts.importPath || (opts.filename && dirname(opts.filename)) || '.'
  })
  build(module_, cc)
  if (cc.errors) return null
  resolve(module_, cc)
  if (cc.errors) return null
  return module_
}

export function compileFile (fname, opts = {}) {
  let src = readFileSync(fname, opts.encoding || 'utf8')
  let copts = Object.create(opts)
  copts.filename = fname
  return compile(src, copts)
}

class CompilerContext {
  constructor (module_, opts) {
    this.module = module_
    this.opts = opts
    this.errors = 0
    this.exportCount = 0
    this.dynamicDepth = 0
    this.env = builtins
  }

  createEnv () {
    this.env = Object.create(this.env)
    return this.env
  }

  enterEnv (env) {
    this.env = env
  }

  leaveEnv () {
    this.env = Object.getPrototypeOf(this.env)
  }

  lookup (id) {
    if (id in this.env) {
      return this.env[id]
    } else {
      this.error(`${id}: undeclared identifier`)
    }
  }

  bind (id, value) {
    if (this.env.hasOwnProperty(id)) {
      this.error(`${id}: duplicate identifier`)
    } else {
      this.env[id] = value
    }
  }

  export (node, id) {
    this.exportCount++
    if (id) {
      this.module.exports[id] = node
    } else {
      if (this.module.defaultExport) {
        this.error(`duplicate default export`)
      } else {
        this.module.defaultExport = node
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
    node.env = cc.createEnv()
    for (let decl of node.declList) {
      build(decl, cc)
    }
    cc.leaveEnv()
    if (!cc.exportCount) {
      cc.error(`a module should export something`)
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
        cc.bind(item.localId, importValue(donor[item.originalId],
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

  Export (node, cc) {
    if (node.body instanceof model.Const) {
      cc.export(node.body, node.body.id)
    } else {
      cc.export(node.body)
    }
    build(node.body, cc)
  },

  Const (node, cc) {
    if (cc.dynamicDepth === 0) node.env = cc.env
    cc.bind(node.id, node)
    build(node.body, cc)
  },

  LocalEnvironment (node, cc) {
    node.staticEnv = cc.createEnv()
    if (cc.dynamicDepth === 0) node.env = node.staticEnv
    for (let decl of node.declList) {
      build(decl, cc)
    }
    build(node.body, cc)
    cc.leaveEnv()
  },

  OrPattern (node, cc) {
    node.items.forEach(i => build(i, cc))
  },

  AndPattern (node, cc) {
    node.items.forEach(i => build(i, cc))
  },

  Member (node, cc) {
    build(node.expr, cc)
  },

  Call (node, cc) {
    build(node.expr, cc)
    node.args.forEach(i => build(i, cc))
  },

  ObjectPattern (node, cc) {
    node.propertyList.forEach(i => build(i, cc))
  },

  PropertyPattern (node, cc) {
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
 * A compilation step that checks validity of identifier references.
 */
function resolve (node, cc) {
  let method = resolver[node.constructor.name]
  if (method) method(node, cc)
}
const resolver = {

  Module (node, cc) {
    cc.enterEnv(node.env)
    for (let key of Object.keys(cc.env)) {
      resolve(cc.env[key], cc)
    }
    if (node.defaultExport) {
      resolve(node.defaultExport, cc)
    }
    cc.leaveEnv()
  },

  LocalEnvironment (node, cc) {
    cc.enterEnv(node.staticEnv)
    for (let key of Object.keys(cc.env)) {
      resolve(cc.env[key], cc)
    }
    resolve(node.body, cc)
    cc.leaveEnv()
  },

  OrPattern (node, cc) {
    node.items.forEach(i => resolve(i, cc))
  },

  AndPattern (node, cc) {
    node.items.forEach(i => resolve(i, cc))
  },

  Member (node, cc) {
    resolve(node.expr, cc)
  },

  Reference (node, cc) {
    cc.lookup(node.id)
  },

  Call (node, cc) {
    resolve(node.expr, cc)
    node.args.forEach(i => resolve(i, cc))
  },

  ObjectPattern (node, cc) {
    node.propertyList.forEach(i => resolve(i, cc))
  },

  ArrayPattern (node, cc) {
    node.items.forEach(i => resolve(i, cc))
  },

  PropertyPattern (node, cc) {
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
function importValue (value, originalId, localId, moduleSpec, error) {
  switch (typeof value) {
    case 'function':
      return new model.NativePattern(value)
    case 'object':
      if (value instanceof RegExp) {
        return model.RegExp_.fromRegExp(value)
      } else if (Array.isArray(value)) {
        error(`${originalId} imported from '${moduleSpec}': can't import an array`)
      } else {
        return value
      }
      break
    case 'number':
    case 'string':
    case 'null':
    case 'boolean':
      return new model.Literal(value)
    default:
      error(`${originalId} imported from '${moduleSpec}' has ` +
        `illegal type '${typeof value}'`)
      return new model.Literal(value)
  }
}

function compileBuiltins (builtin) {
  let decls = {}
  for (let b in builtin) {
    decls[b] = importValue(builtin[b], b, b, './builtin', _ => null)
  }
  return decls
}
