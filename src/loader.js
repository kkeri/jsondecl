import * as fs from 'fs'
import * as Path from 'path'
import { parse } from './parser'
import { Diagnostics } from './diag'
import { bindModule } from './bind'

export class ModuleLoader {
  constructor () {
    this.cache = {}
  }

  compile (str, {
    id = '',
    resolvePath,
    messages,
    diag = new Diagnostics(messages)
  } = {}) {
    try {
      const modul = parse(str, { diag })
      if (!modul) return null
      modul.id = id
      if (id) this.cache[id] = modul
      bindModule(modul, this, { diag, resolvePath })
      if (diag.hasError) return null
      return modul
    } catch (e) {
      diag.error('Internal error: ' + e.message)
      return null
    }
  }

  load (path, {
    encoding = 'utf8',
    messages,
    diag
  } = {}) {
    path = Path.resolve(path)
    let modul = this.cache[path]
    if (!modul) {
      let src = fs.readFileSync(path, encoding)
      modul = this.compile(src, {
        id: path,
        resolvePath: Path.dirname(path),
        diag,
        messages
      })
    }
    return modul
  }
}
