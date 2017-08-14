import { parse } from './parser'

export function compile (str, opts = {}) {
  let cc = {
    decls: opts.declarations || {}
  }
  const module = parse(str)
  if (!module) return null
  module.compile(cc)
  return module
}
