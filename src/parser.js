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

  Module_short (imports, expr) {
    return new model.Module(imports.model(),
      [new model.Const('', expr.model(), true)])
  },
  Module_long (imports, decls, expr) {
    let declList = decls.model()
    let exprList = expr.model()
    if (exprList.length) declList.push(new model.Const('', expr[0], true))
    return new model.Module(imports.model(), declList)
  },

  // import

  Import_list (_imp_, _lbr_, items, _rbr_, _from_, moduleSpec) {
    return new model.Import(moduleSpec.model(), items.asIteration().model())
  },
  ImportItem_simple (id) {
    return new model.ImportItem(id.model(), id.model())
  },

  // declaration

  Declaration_const (_const_, id, _eq_, expr) {
    return new model.Const(id.model(), expr.model(), false)
  },
  Declaration_export_const (_exp_, _const_, id, _eq_, expr) {
    return new model.Const(id.model(), expr.model(), true)
  },
  Declaration_export_default (_exp_, _def_, expr) {
    return new model.Const('', expr.model(), true)
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
  ChainedCall (list) {
    let calls = list.asIteration().model()
    if (calls.length === 1) {
      return calls[0]
    } else {
      return new model.ChainedCall(calls)
    }
  },
  Call (id, argsOpt) {
    argsOpt = argsOpt.model()
    var args = argsOpt.length ? argsOpt[0] : []
    return new model.Call(id.model(), args)
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

  ArgumentList (_lp_, args, _rp_) {
    return args.asIteration().model()
  },
  Property (name, _colon_, value) {
    return new model.Property(name)
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
  regexp (slash1, body, slash2) {
    return new model.RegExp(new RegExp(body.source.contents))
  },
  constant_null (_null_) {
    return new model.Literal(null)
  },
  constant_true (_true_) {
    return new model.Literal(true)
  },
  constant_false (_false_) {
    return new model.Literal(false)
  }
}
