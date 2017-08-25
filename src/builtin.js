
export const any = (x) => true

export const boolean = (x) => typeof x === 'boolean'

export const string = (x) => typeof x === 'string'

export const number = (x) => typeof x === 'number'

export const integer = (x) => number(x) && Math.floor(x) === x

export const lt = (x, y) => number(x) && number(y) && x < y

export const le = (x, y) => number(x) && number(y) && x <= y

export const gt = (x, y) => number(x) && number(y) && x > y

export const ge = (x, y) => number(x) && number(y) && x >= y
