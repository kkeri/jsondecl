import { readFileSync } from 'fs'
import { join } from 'path'
import { makeRecipe } from 'ohm-js'
import * as model from './model'

var parser
var semantics

export function parse (str, opts = {}) {
  if (!parser) {
    initParser()
  }
  let mr = parser.match(str)
  if (mr.failed()) {
    if (opts.error) opts.error(mr.message)
    return null
  } else {
    return semantics(mr).model()
  }
}

/**
 * Loads parser definition and initilizes parser semantics.
 */
function initParser () {
  let recipePath = join(__dirname, '../ohm/recipe.js')
  let recipe = readFileSync(recipePath, 'utf-8')
  // this is the recommended way of loading a parser
  parser = makeRecipe(eval(recipe)) // eslint-disable-line

  semantics = parser.createSemantics()
  semantics.addOperation('model', modelActions)
}

const modelActions = {

  // module

  Module_nodef (imports, decls) {
    return new model.Module(imports.model(), decls.model())
  },
  Module_def (imports, decls, expr, term) {
    let defExp = new model.Declaration('', expr.model(), true)
    return new model.Module(imports.model(), decls.model().concat(defExp))
  },

  // import

  Import_list (_imp_, items, _from_, moduleSpec, term) {
    return new model.Import(moduleSpec.model(), items.model())
  },
  NamedImports_empty (_lbr_, _rbr_) {
    return []
  },
  NamedImports_list (_lbr_, items, _commaOpt_, _rbr_) {
    return items.asIteration().model()
  },
  ImportSpecifier_simple (id) {
    return new model.ImportSpecifier(id.model(), id.model())
  },
  ImportSpecifier_rename (origId, _as_, localId) {
    return new model.ImportSpecifier(origId.model(), localId.model())
  },

  // declaration

  Declaration_const (_const_, id, _eq_, expr, term) {
    return new model.Declaration(id.model(), expr.model(), false)
  },
  Declaration_export_const (_exp_, _const_, id, _eq_, expr, term) {
    return new model.Declaration(id.model(), expr.model(), true)
  },
  Declaration_export_default (_exp_, _def_, expr, term) {
    return new model.Declaration('', expr.model(), true)
  },

  // expression

  LogicalOr (list) {
    let items = list.asIteration().model()
    if (items.length === 1) {
      return items[0]
    } else {
      return new model.LogicalOr(items)
    }
  },
  LogicalAnd (list) {
    let items = list.asIteration().model()
    if (items.length === 1) {
      return items[0]
    } else {
      return new model.LogicalAnd(items)
    }
  },
  LogicalNot (list, expr) {
    if (list.model().length % 2 === 1) {
      return new model.LogicalNot(expr.model())
    } else {
      return expr.model()
    }
  },
  Grouping (_lp_, expr, _rp_) {
    return expr.model()
  },
  Chain (list) {
    let items = list.asIteration().model()
    if (items.length === 1) {
      return items[0]
    } else {
      return new model.Chain(items)
    }
  },
  Ref (id) {
    return new model.Reference(id.model())
  },
  Call (id, _lp_, args, _rp_) {
    return new model.Call(id.model(), args.asIteration().model())
  },
  Object (_lb_, props, _rb_) {
    return new model.Object_(props.asIteration().model())
  },
  Array (_lb_, items, _rb_) {
    return new model.Array_(items.asIteration().model())
  },
  String (str) {
    return new model.Literal(str.model())
  },

  // helpers

  Property (name, _colon_, value) {
    return new model.Property(name.model(), value.model())
  },

  // lexical rules

  identifier (start, rest) {
    return this.source.contents
  },
  number (sign, int, _point_, frac, exp) {
    return new model.Literal(parseFloat(this.source.contents))
  },
  string (quote1, chars, quote2) {
    return chars.source.contents
  },
  regexp (slash1, body, slash2, flags) {
    return new model.RegExp_(body.source.contents, flags.model())
  },
  regexpFlags (chars) {
    return this.source.contents
  },
  constant_null (_null_) {
    return new model.Literal(null)
  },
  constant_true (_true_) {
    return new model.Literal(true)
  },
  constant_false (_false_) {
    return new model.Literal(false)
  },
  _terminal () {
    return this.source.contents
  }
}
