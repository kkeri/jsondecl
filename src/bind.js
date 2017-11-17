import { importModule, importValue } from './import'
import * as builtin from './builtin'
import * as model from './model'
import { Diagnostics } from './diag'

const builtins = compileBuiltins(builtin)

function compileBuiltins (builtin) {
  const diag = new Diagnostics()
  let decls = {}
  for (let b in builtin) {
    decls[b] = importValue(builtin[b], {
      originalId: b,
      moduleSpec: 'builtin'
    })
  }
  if (diag.hasError) throw new Error('Error loading builtins')
  return decls
}

class BindContext {
  constructor (loader, {
      diag,
      baseDir = ''
  } = {}) {
    this.loader = loader
    this.diag = diag
    this.baseDir = baseDir
    this.exports = {}
    this.defaultExport = undefined
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

  bind (id, value, node) {
    if (this.env.hasOwnProperty(id)) {
      this.diag.error(`${id}: duplicate identifier`, node)
    } else {
      this.env[id] = value
    }
  }

  export (node, id) {
    this.exportCount++
    if (id) {
      this.exports[id] = node
    } else {
      if (this.defaultExport) {
        this.diag.error(`duplicate default export`, node)
      } else {
        this.exports['default'] = node
        this.defaultExport = node
      }
    }
  }
}

function bind (node, bc) {
  let f = bindVisitor[node.constructor.name]
  if (f) f(node, bc)
}
const bindVisitor = {

  Module (node, bc) {
    node.env = bc.createEnv()
    for (let decl of node.declList) {
      bind(decl, bc)
    }
    bc.leaveEnv()
    if (!bc.exportCount) {
      bc.diag.error(`a module should export something`, node)
    }
  },

  Import (node, bc) {
    const exports = importModule(bc.loader, node, {
      diag: bc.diag,
      baseDir: bc.baseDir
    })
    if (!exports) return
    for (let item of node.importList) {
      if (item.originalId in exports) {
        const value = importValue(exports[item.originalId], {
          originalId: item.originalId,
          moduleSpec: node.moduleSpec,
          diag: bc.diag,
          importNode: node
        })
        bc.bind(item.localId, value)
      } else {
        bc.diag.error(`${item.originalId}: identifier not defined in module ` +
          `'${node.moduleSpec}'`, item)
      }
    }
  },

  Export (node, bc) {
    if (node.body instanceof model.Const) {
      bc.export(node.body, node.body.id)
    } else {
      bc.export(node.body)
    }
    bind(node.body, bc)
  },

  Const (node, bc) {
    if (bc.dynamicDepth === 0) node.env = bc.env
    bc.bind(node.id, node)
    bind(node.body, bc)
  },

  LocalEnvironment (node, bc) {
    node.staticEnv = bc.createEnv()
    if (bc.dynamicDepth === 0) node.env = node.staticEnv
    for (let decl of node.declList) {
      bind(decl, bc)
    }
    bind(node.body, bc)
    bc.leaveEnv()
  },

  OrPattern (node, bc) {
    node.items.forEach(i => bind(i, bc))
  },

  AndPattern (node, bc) {
    node.items.forEach(i => bind(i, bc))
  },

  Member (node, bc) {
    bind(node.expr, bc)
  },

  Call (node, bc) {
    bind(node.expr, bc)
    node.args.forEach(i => bind(i, bc))
  },

  ObjectPattern (node, bc) {
    node.propertyList.forEach(i => bind(i, bc))
  },

  PropertyPattern (node, bc) {
    bind(node.name, bc)
    bind(node.value, bc)
  },

  RegExp_ (node, bc) {
    if (node.flags && node.flags !== 'i') {
      bc.diag.error(`'${node.flags}': illegal regexp flag (only 'i' is allowed)`, node)
      return
    }
    try {
      node.regexp = new RegExp(node.body, node.flags)
    } catch (e) {
      bc.diag.error(e.message, node)
    }
  }
}

export function bindModule (modul, loader, {
  diag,
  baseDir = ''
} = {}) {
  const bc = new BindContext(loader, { diag, baseDir })
  bind(modul, bc)
  if (diag.hasError) return
  modul.exports = bc.exports
  modul.defaultExport = bc.defaultExport
}
