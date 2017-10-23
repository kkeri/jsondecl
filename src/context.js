
export class TestContext {
  constructor (env) {
    this.pathStack = []
    this.env = env
    this.tr = {
      matchSet: null,
      modifiedSets: []
    }
  }

  begin () {
    this.tr = {
      prev: this.tr,
      matchSet: this.tr.matchSet ? {} : null,
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
    this.tr = this.tr.prev
  }

  rollback () {
    for (let set of this.tr.modifiedSets) {
      set.rollback()
    }
    this.tr = this.tr.prev
  }

  error (msg) {
    console.log(msg)
  }
}
