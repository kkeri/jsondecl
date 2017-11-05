
export class Context {
  constructor ({
    diag = function (desc) {}
  } = {}) {
    this.diag = diag
    this.warnings = 0
    this.errors = 0
  }

  info (msg, node) {
    this.diag({
      message: msg,
      severity: 'info'
    })
  }

  warning (msg, node) {
    this.warnings++
    this.diag({
      message: msg,
      severity: 'warning'
    })
  }

  error (msg, node) {
    this.errors++
    this.diag({
      message: msg,
      severity: 'error'
    })
  }

  fatal (msg, node) {
    this.errors++
    this.diag({
      message: msg,
      severity: 'error',
      fatal: true
    })
  }
}

export class TestContext extends Context {
  constructor ({
    env = {},
    diag
  } = {}) {
    super({ diag })
    this.env = env
    this.pathStack = []
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
