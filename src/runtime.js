import { Diagnostics } from './diag'

export class RuntimeContext {
  constructor (env = {}, {
    messages
  } = {}) {
    this.diag = new Diagnostics(messages)
    this.env = env
    this.pathStack = []
    this.tr = {
      matchSet: null,
      arrayMatchLimit: 0,
      modifiedSets: []
    }
  }

  begin () {
    this.tr = {
      prev: this.tr,
      matchSet: this.tr.matchSet ? {} : null,
      arrayMatchLimit: this.tr.arrayMatchLimit,
      modifiedSets: []
    }
  }

  commit () {
    const tr = this.tr
    for (let set of tr.modifiedSets) {
      set.commit()
    }
    let topMatchSet = tr.matchSet
    if (topMatchSet) {
      let prevMatchSet = tr.prev.matchSet
      for (let name in topMatchSet) prevMatchSet[name] = true
    }
    tr.prev.arrayMatchLimit =
      Math.max(tr.prev.arrayMatchLimit, tr.arrayMatchLimit)
    this.tr = tr.prev
  }

  rollback () {
    const tr = this.tr
    for (let set of tr.modifiedSets) {
      set.rollback()
    }
    this.tr = tr.prev
  }
}
