import { readFileSync } from 'fs'
import { compile } from './compiler'
export { compile } from './compiler'

export function compileFileSync (fname, opts = {}) {
  let src = readFileSync(fname, opts.encoding || 'utf8')
  let copts = Object.create(opts)
  copts.filename = fname
  return compile(src, copts)
}
