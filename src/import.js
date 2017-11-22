import Path from 'path'
import resolve from 'resolve'
import * as model from './model'

export function importModule (loader, importNode, {
  baseDir = '',
  diag
}) {
  let modulePath
  try {
    modulePath = resolve.sync(importNode.moduleSpec, {
      basedir: baseDir,
      extensions: ['.jsondl', '.js', '.json'],
      preserveSymlinks: false
    })
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      diag.error(e.message, importNode)
      return null
    }
  }
  const ext = Path.extname(modulePath)
  switch (ext) {
    case '':
    case '.json':
    case '.jsondl':
      let modul = loader.load(modulePath, { diag })
      return modul ? modul.exports : null
    case '.js':
      try {
        return require(modulePath)
      } catch (e) {
        if (e.code === 'MODULE_NOT_FOUND') {
          diag.error(`${importNode.moduleSpec} not found at path '${modulePath}'`, importNode)
          return null
        }
      }
      break
    default:
      diag.error(`${modulePath}: unsupported file extension`, importNode)
      return null
  }
}

export function importValue (value) {
  switch (typeof value) {
    case 'function':
      return new model.NativePattern(value)
    case 'object':
      if (value instanceof RegExp) {
        return model.RegExp_.fromRegExp(value)
      } else if (Array.isArray(value)) {
        return new model.Literal(value)
      } else {
        return value
      }
    default:
      return new model.Literal(value)
  }
}
