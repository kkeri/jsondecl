'use strict'

const fs = require('fs')
const path = require('path')
const ohm = require('ohm-js')
const model = require('./model')

const ObjectPrototype = Object.prototype

var parser
var semantics

function parse(str) {
  if (!parser) {
    initParser()
  }
  let mr = parser.match(str)
  if (mr.failed()) {
    return {
      success: false,
      diagnostics: [
        {
          severity: 'error',
          message: mr.message
        }
      ]
    }
  } else {
    return {
      success: true,
      result: semantics(mr).model(),
      format: 'model.jsondecl'
    }
  }
}

/**
 * Loads parser definition and initilizes parser semantics.
 */
function initParser() {
  let recipePath = path.join(__dirname, './ohm/recipe.js')
  let recipe = fs.readFileSync(recipePath, 'utf-8')
  /* jshint -W061 */
  // this is the recommended way of loading a parser
  parser = ohm.makeRecipe(eval(recipe))
  /* jshint +W061 */

  semantics = parser.semantics()
  semantics.addOperation('model', modelActions)
}

const modelActions = {

  // module

  Module_simple(expr) {
    return new model.Module([], new model.Constant("", expr.model(), true))
  },
  Module_compound(imports, decls) {
    return new model.Module(imports.model(), decls.model())
  },

  // import

  Import_list(_imp_, _lbr_, items, _rbr_, _from_, moduleSpec) {
    return new model.Import(moduleSpec.model(), items.model())
  },
  ImportItem_simple(id) {
    return new model.ImportItem(id.model(), id.model())
  },

  // declaration

  Declaration_const(id, _eq_, expr) {
    return new model.Constant(id.model(), expr.model(), false)
  },
  Declaration_export_const(_exp_, _const_, id, _eq_, expr) {
    return new model.Constant(id.model(), expr.model(), true)
  },
  Declaration_export_default(_exp_, _def_, _eq_, expr) {
    return new model.Constant("", expr.model(), true)
  },

  // expression

  LogicalOr_op(list) {
    return new model.LogicalOr(list.asIteration().model())
  },
  LogicalAnd_op(list) {
    return new model.LogicalAnd(list.asIteration().model())
  },
  Not_op(list, expr) {
    if (list.asIteration().model().length % 2 === 1) {
      return new model.LogicalNot(expr.model())
    } else {
      return expr.model()
    }
  },
  Grouping(_lp_, expr, _rp_) {
    return expr.model()
  },
  ChainedCall(calls) {
    return new model.ChainedCall(calls.asIteration().model())
  },
  Call(id, args_opt) {
    args_opt = args_opt.model()
    var args = args_opt.length ? args_opt[0] : []
    return new model.Call(id.model(), args)
  },
  Object(_lb_, props, _rb_) {
    return new model.Object(props.asIteration().model())
  },
  List(_lb_, items, _rb_) {
    return new model.List(items.asIteration().model())
  },

  // helpers

  ArgumentList(_lp_, args, _rp_) {
    return args.asIteration().model()
  },
  Property(name, _colon_, value) {
    return new model.Property(name)
  },

  // lexical rules

  identifier(id) {
    return new model.Identifier(id.interval.contents)
  },
  number(chars) {
    return new model.Literal(parseFloat(this.interval.contents))
  },
  string(quote1, chars, quote2) {
    return new model.Literal(chars.interval.contents)
  },
  regexp(slash1, body, slash2) {
    return new model.RegExp(new RegExp(body.interval.contents))
  },
  constant_null(_null_) {
    return new model.Literal(null)
  },
  constant_true(_true_) {
    return new model.Literal(true)
  },
  constant_false(_false_) {
    return new model.Literal(false)
  }
}

exports.parse = parse
