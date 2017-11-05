
const idRegEx = /^[_a-zA-Z][_a-zA-Z0-9]*$/

export function arrayToJsonPath (arr) {
  let path = '$'
  for (let id of arr) {
    if (typeof id === 'number') {
      path += '[' + id + ']'
    } else if (!idRegEx.test(id)) {
      path += '["' + id + '"]'
    } else {
      path += '.' + id
    }
  }
  return path
}

export class FatalError {
  constructor (type, ref, msg) {
    this.type = type
    this.ref = ref
    this.message = msg
  }
}
