import { Diagnostics } from './diag'

export class RuntimeContext {
  constructor (env = {}, {
    messages
  } = {}) {
    this.env = env
    this.pathStack = []
    this.tr = {
      diag: new Diagnostics(messages),
      matchSet: null,
      nextArrayIdx: 0,
      modifiedSets: []
    }
  }

  info (msg, node) {
    this.tr.diag.info(msg, node)
  }

  warning (msg, node) {
    this.tr.diag.warning(msg, node)
  }

  error (msg, node) {
    this.tr.diag.error(msg, node)
  }

  begin () {
    this.tr = {
      prev: this.tr,
      diag: new Diagnostics(),
      matchSet: this.tr.matchSet ? {} : null,
      nextArrayIdx: this.tr.nextArrayIdx,
      modifiedSets: []
    }
  }

  succeed () {
    const tr = this.tr
    for (let set of tr.modifiedSets) {
      set.commit()
    }
    let topMatchSet = tr.matchSet
    if (topMatchSet) {
      let prevMatchSet = tr.prev.matchSet
      for (let name in topMatchSet) prevMatchSet[name] = true
    }
    tr.prev.nextArrayIdx =
      Math.max(tr.prev.nextArrayIdx, tr.nextArrayIdx)
    this.tr = tr.prev
  }

  fail () {
    const tr = this.tr
    for (let set of tr.modifiedSets) {
      set.rollback()
    }
    tr.diag.appendTo(tr.prev.diag)
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
