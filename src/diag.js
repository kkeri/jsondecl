
export class RuntimeError {
  constructor (code, ref, msg) {
    this.code = code
    this.ref = ref
    this.message = msg
  }
}

export class Diagnostics {
  constructor (messages = []) {
    this.messages = messages
    this.hasError = false
  }

  info (msg, node) {
    this.messages.push({ message: msg, severity: 'info' })
  }

  warning (msg, node) {
    this.messages.push({ message: msg, severity: 'warning' })
  }

  error (msg, node) {
    this.messages.push({ message: msg, severity: 'error' })
    this.hasError = true
  }

  fatal (msg, node) {
    this.messages.push({ message: msg, severity: 'error', fatal: true })
    this.hasError = true
  }

  appendTo (other) {
    other.list = other.list.concat(this.messages)
    other.hasError = other.hasError || this.hasError
  }

  log () {
    Diagnostics.log(this.messages)
  }

  static log (list) {
    if (list.length === 0) {
      console.log('Ok.')
    } else {
      for (var diag of list) {
        console.log(diag.message)
      }
    }
  }
}
