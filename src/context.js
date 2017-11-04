
export class TestContext {
  constructor ({
    env = {},
    error = function (msg, node) {}
  } = {}) {
    this.pathStack = []
    this.env = env
    this.error = error
    this.tr = {
      matchSet: null,
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
    for (let set of this.tr.modifiedSets) {
      set.commit()
    }
    let topMatchSet = this.tr.matchSet
    if (topMatchSet) {
      let prevMatchSet = this.tr.prev.matchSet
      for (let name in topMatchSet) prevMatchSet[name] = true
    }
    this.tr.prev.arrayMatchLimit =
      Math.max(this.tr.prev.arrayMatchLimit, this.tr.arrayMatchLimit)
    this.tr = this.tr.prev
  }

  rollback () {
    for (let set of this.tr.modifiedSets) {
      set.rollback()
    }
    this.tr = this.tr.prev
  }
}
