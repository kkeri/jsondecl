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
      return loader.load(modulePath, { diag }).exports
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

/**
 * Creates a declaration from an imported value.
 * @param {*} value value to be imported
 * @param {string} originalId foreign id of the imported element
 * @param {string} moduleSpec foreign module name for diagnostics
 */
export function importValue (value, {
  originalId,
  moduleSpec,
  diag,
  importNode
}) {
  switch (typeof value) {
    case 'function':
      return new model.NativePattern(value)
    case 'object':
      if (value instanceof RegExp) {
        return model.RegExp_.fromRegExp(value)
      } else if (Array.isArray(value)) {
        diag.error(`${originalId} imported from '${moduleSpec}': ` +
          `can't import an array`, importNode)
        return new model.Expression()
      } else {
        return value
      }
    case 'number':
    case 'string':
    case 'null':
    case 'boolean':
      return new model.Literal(value)
    default:
      diag.error(`${originalId} imported from '${moduleSpec}' has ` +
        `illegal type '${typeof value}'`, importNode)
      return new model.Expression()
  }
}
