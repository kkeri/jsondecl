
export class TransactionalMap {
  constructor (tc) {
    this.tc = tc
    this.map = new Map()
    this.tr = null
    this.mapStack = []
    this.trStack = []
  }

  get (key) {
    if (this.map.has(key)) return this.map.get(key)
    for (let i = this.mapStack.length - 1; i >= 0; i--) {
      if (this.mapStack[i].has(key)) return this.mapStack[i].get(key)
    }
    return false
  }

  set (key, value) {
    if (this.tr !== this.tc.tr) this.begin(this.tc.tr)
    this.map.set(key, value)
    return this
  }

  size () {
    return this.map.size
  }

  begin (tr) {
    this.mapStack.push(new Map())
    this.trStack.push(tr)
    tr.modifiedSets.push(this)
  }

  commit () {
    let top = this.map
    this.map = this.mapStack.pop()
    this.tr = this.trStack.pop()
    top.forEach((k, v) => this.map.set(k, v))
  }

  rollback () {
    this.map = this.mapStack.pop()
    this.tr = this.trStack.pop()
  }

  doEval (tc) {
    return this
  }
}
