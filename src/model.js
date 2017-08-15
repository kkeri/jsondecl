
export class Module {
  constructor (importList, declList) {
    this.importList = importList
    this.declList = declList
    this.decls = {}
    this.exports = {}
    this.defaultExport = undefined
  }

  compile (cc) {
    cc.module = this
    for (let import_ of this.importList) {
      import_.compile(cc)
    }
    for (let decl of this.declList) {
      decl.compile(cc)
    }
  }

  addConst (id, expr, exported) {

  }
}

export class Import {
  constructor (moduleSpec, importList) {
    this.moduleSpec = moduleSpec
    this.importList = importList
  }
}

export class ImportItem {
  constructor (origId, localId) {
    this.origId = origId
    this.localId = localId
  }
}

export class Const {
  constructor (id, value, exported) {
    this.id = id
    this.value = value
    this.exported = exported
  }
}

// expression

export class Expression {
  constructor () {
    if (new.target === Expression) {
      throw new Error(`can't instantiate abstract class`)
    }
  }

  match (value) {
    throw new Error(`can't call abstract method`)
  }
}

export class LogicalOr extends Expression {
  constructor (items) {
    super()
    this.items = items
  }

  match (value) {
    for (let item of this.items) {
      if (item.match(value)) {
        return true
      }
    }
    return false
  }

  bind (module) {

  }
}

export class LogicalAnd extends Expression {
  constructor (items) {
    super()
    this.items = items
  }

  match (value) {
    for (let item of this.items) {
      if (!item.match(value)) {
        return false
      }
    }
    return true
  }

  bind (module) {

  }
}

export class ChainedCall extends Expression {
  constructor (calls) {
    super()
    this.calls = calls
  }

  match (value) {
    let max = this.calls.length - 1
    for (let i = 0; i < max; i++) {
      value = this.calls[i].eval(value)
    }
    return this.calls[max].validate(value)
  }

  bind (module) {

  }
}

export class Call extends Expression {
  constructor (id, args) {
    super()
    this.id = id
    this.args = args
  }

  eval () {
    return this.value
  }

  match (value) {
    this.source.eval()
  }

  bind (module) {

  }
}

export class NativeCall extends Expression {
  constructor (func, args) {
    super()
    this.func = func
    this.args = args
  }

  eval () {
    return this.func.eval()
  }

  match (value) {
    this.source.eval()
  }

  bind (module) {

  }
}

export class Object_ extends Expression {
  constructor (properties) {
    super()
    this.properties = properties
    for (let i = 0; i < properties.length; i++) {
      properties[i].index = i
    }
  }

  match (value) {
    if (typeof value !== 'object' || value === null) {
      return false
    }
    let occ = new Array(this.properties.length).fill(0)
    // this should be optimized to be nearly linear
    // tip: most property names will be simply strings
    for (let name of Object.getOwnPropertyNames(value)) {
      let match = false
      for (let prop of this.properties) {
        if (prop.name.match(name) && prop.value.match(value[name])) {
          match = true
          occ[prop.index]++
        }
      }
      if (!match) {
        return false
      }
    }
    for (let prop of this.properties) {
      if (occ[prop.index] < prop.minCount || occ[prop.index] > prop.maxCount) {
        return false
      }
    }
    return true
  }

  bind (module) {

  }
}

export class Array_ extends Expression {
  constructor (items) {
    super()
    this.items = items
  }

  match (value) {
    if (!Array.isArray(value)) {
      return false
    }
    let vidx = 0
    for (let item of this.items) {
      let o = 0
      while (o < item.maxCount && vidx < value.length && item.match(value[vidx++])) {
        o++
      }
      if (o < item.minCount) {
        return false
      }
    }
    return true
  }

  bind (module) {

  }
}

// helpers

export class Property extends Expression {
  constructor (name, value, minCount, maxCount) {
    super()
    this.name = name
    this.value = value
    this.minCount = minCount || 1
    this.maxCount = maxCount || 1
  }
}

export class ListItem extends Expression {
  constructor (value) {
    super()
    this.value = value
  }
}

// leaf nodes

export class Identifier extends Expression {
  constructor (name) {
    super()
    this.name = name
  }

  bind () {
    return this
  }
}

export class Literal extends Expression {
  constructor (value) {
    super()
    this.value = value
  }

  eval () {
    return this.value
  }

  match (value) {
    return this.value === value
  }

  bind () {
    return this
  }
}

export class Regexp extends Expression {
  constructor (regexp) {
    super()
    this.regexp = regexp
  }

  eval () {
    return this.regexp
  }

  match (value) {
    return this.regexp.test(value)
  }

  bind () {
    return this
  }
}
