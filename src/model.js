
export class Module {
  constructor (importList, declList) {
    this.importList = importList
    this.declList = declList
    this.decls = {}
    this.exports = {}
    this.defaultExport = undefined
  }

  test (value, id = '') {
    if (id === '') {
      if (!this.defaultExport) {
        throw new Error('attempt to test against the default declaration but it is not declared')
      }
      return this.defaultExport.test(value)
    } else {
      if (!(id in this.exports)) {
        throw new Error(`attempt to test against '${id}' but it is not declared`)
      }
      return this.exports[id].test(value)
    }
  }
}

export class Import {
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

export class Declaration {
  constructor (id, body, exported) {
    this.id = id
    this.body = body
    this.exported = exported
  }

  test (value) {
    return this.body.test(value)
  }
}

// expression

export class Expression {
  constructor () {
    if (new.target === Expression) {
      throw new Error(`can't instantiate abstract class`)
    }
  }

  test (value) {
    throw new Error(`can't call abstract method`)
  }
}

export class LogicalOr extends Expression {
  constructor (items) {
    super()
    this.items = items
  }

  test (value) {
    for (let item of this.items) {
      if (item.test(value)) {
        return true
      }
    }
    return false
  }
}

export class LogicalAnd extends Expression {
  constructor (items) {
    super()
    this.items = items
  }

  test (value) {
    for (let item of this.items) {
      if (!item.test(value)) {
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

  test (value) {
    return !this.expr.test(value)
  }
}

export class Chain extends Expression {
  constructor (items) {
    super()
    this.items = items
  }

  eval (value) {
    for (let item of this.items) {
      value = item.eval(value)
    }
    return value
  }

  test (value) {
    let max = this.items.length - 1
    for (let i = 0; i < max; i++) {
      value = this.items[i].eval(value)
    }
    return this.items[max].validate(value)
  }
}

export class Reference extends Expression {
  constructor (id) {
    super()
    this.id = id
  }

  eval (base) {
    return this.pattern.eval(base)
  }

  test (value) {
    return this.pattern.test(value)
  }
}

export class Call extends Expression {
  constructor (id, args = []) {
    super()
    this.id = id
    this.args = args
  }

  eval (base) {
    return this.func.eval.call(null, base, ...this.args.map(i => i.eval(base)))
  }

  test (value) {
    return this.func.test.call(null, value, ...this.args.map(i => i.eval(value)))
  }
}

export class Function_ extends Expression {
  constructor (params, body) {
    super()
    this.params = params
    this.body = body
  }

  eval () {
    return this.value
  }

  test (value) {
    this.source.eval()
  }
}

export class Custom extends Expression {
  constructor (eval_, test) {
    super()
    this.eval = eval_
    this.test = test
  }
}

export class Object_ extends Expression {
  constructor (propertyList) {
    super()
    this.propertyList = propertyList
    for (let i = 0; i < propertyList.length; i++) {
      propertyList[i].index = i
    }
  }

  test (value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return false
    }
    for (let prop of this.propertyList) {
      if (!prop.test(value)) return false
    }
    return true
  }

  // test (value) {
  //   if (typeof value !== 'object' || value === null || Array.isArray(value)) {
  //     return false
  //   }
  //   let occ = new Array(this.propertyList.length).fill(0)
  //   // this should be optimized to be nearly linear
  //   // tip: most property names will be simply strings
  //   for (let name of Object.getOwnPropertyNames(value)) {
  //     let match = false
  //     for (let prop of this.propertyList) {
  //       if (prop.name.test(name) && prop.value.test(value[name])) {
  //         match = true
  //         occ[prop.index]++
  //       }
  //     }
  //     if (!match) {
  //       return false
  //     }
  //   }
  //   for (let prop of this.propertyList) {
  //     if (occ[prop.index] < prop.minCount || occ[prop.index] > prop.maxCount) {
  //       return false
  //     }
  //   }
  //   return true
  // }
}

export class Array_ extends Expression {
  constructor (items) {
    super()
    this.items = items
  }

  test (value) {
    if (!Array.isArray(value)) {
      return false
    }
    let vidx = 0
    for (let item of this.items) {
      let o = 0
      while (o < item.maxCount && vidx < value.length && item.test(value[vidx++])) {
        o++
      }
      if (o < item.minCount) {
        return false
      }
    }
    return true
  }
}

// helpers

export class Property extends Expression {
  constructor (name, value, minCount = 1, maxCount = Infinity) {
    super()
    this.name = name
    this.value = value
    this.minCount = minCount
    this.maxCount = maxCount
  }

  test (value) {
    // this is checked in the object pattern
    // if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    //   return false
    // }
    let occurs = 0
    for (let name of Object.getOwnPropertyNames(value)) {
      if (this.name.test(name)) {
        if (this.value.test(value[name])) {
          occurs++
        } else {
          return false
        }
      }
    }
    if (occurs < this.minCount || occurs > this.maxCount) return false
    return true
  }
}

export class ListItem extends Expression {
  constructor (value) {
    super()
    this.value = value
  }
}

// leaf nodes

export class Literal extends Expression {
  constructor (value) {
    super()
    this.value = value
  }

  eval () {
    return this.value
  }

  test (value) {
    return this.value === value
  }
}

export class RegExp_ extends Expression {
  constructor (body, flags) {
    super()
    this.body = body
    this.flags = flags
  }

  eval () {
    return this.regexp
  }

  test (value) {
    return this.regexp.test(value)
  }
}

export class This extends Expression {
  eval (value) {
    return value
  }
}
