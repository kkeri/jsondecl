
export class TransactionalSet {
  constructor (tc, set) {
    this.tc = tc
    this.set = set
    this.tr = null
    this.setStack = []
    this.trStack = []
  }

  add (value) {
    if (this.tr !== this.tc.tr) this.begin(this.tc.tr)
    this.set.add(value)
    return this
  }

  has (value) {
    if (this.set.has(value)) return true
    for (let i = this.setStack.length - 1; i >= 0; i--) {
      if (this.setStack[i].has(value)) return true
    }
    return false
  }

  size () {
    return this.set.size
  }

  begin (tr) {
    this.setStack.push(new Set())
    this.trStack.push(tr)
    tr.modifiedSets.push(this)
  }

  commit () {
    let top = this.set
    this.set = this.setStack.pop()
    this.tr = this.trStack.pop()
    for (let value of top.values()) this.set.add(value)
  }

  rollback () {
    this.set = this.setStack.pop()
    this.tr = this.trStack.pop()
  }

  doEval (tc) {
    return this
  }
}
