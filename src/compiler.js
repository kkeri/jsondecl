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
      return this.env[id].body
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

  export (node) {
    this.exportCount++
    if (node instanceof model.Const) {
      this.module.exports[node.id] = node.body
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
    cc.export(node.body)
    build(node.body, cc)
  },

  Const (node, cc) {
    if (cc.dynamicDepth === 0) node.env = cc.env
    cc.bind(node.id, node.body)
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
    cc.lookup(node.id)
  },

  Call (node, cc) {
    cc.lookup(node.id)
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
function importValue (value, originalId, localId, moduleSpec, error) {
  switch (typeof value) {
    case 'function':
      return importFunction(value, originalId, localId, moduleSpec, error)
    case 'object':
      return importObject(value, originalId, localId, moduleSpec, error)
    case 'number':
    case 'string':
    case 'null':
    case 'boolean':
      return new model.Literal(value)
    default:
      error(`${originalId} imported from '${moduleSpec}' has` +
        `illegal type '${typeof value}'`)
      return new model.Literal(value)
  }
}

function importFunction (func, originalId, localId, moduleSpec, error) {
  return new model.Custom(null,
    (tc, value, args) => args
     ? func(value, ...args.map(i => i.doEval(tc)))
     : func(value)
  )
}

function importObject (object, originalId, localId, moduleSpec, error) {
  if (object instanceof RegExp) {
    return model.RegExp_.fromRegExp(object)
  }
  if (typeof object.doEval === 'function' &&
    typeof object.doTest === 'function'
  ) {
    return object
  }
  let doEval
  if (typeof object.doEval === 'function') {
    doEval = object.doEval.bind(object)
  } else {
    doEval = () => { throw new Error(`'${localId}' should be used as pattern`) }
  }
  let doTest
  if (typeof object.doTest === 'function') {
    doTest = object.doTest.bind(object)
  } else {
    doTest = () => { throw new Error(`'${localId}' can't be used as pattern`) }
  }
  return new model.Custom(doEval, doTest)
}

function compileBuiltins (builtin) {
  let decls = {}
  for (let b in builtin) {
    decls[b] = importValue(builtin[b], b, './builtin', _ => null)
  }
  return decls
}
