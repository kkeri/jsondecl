'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;

var _fs = require('fs');

var _path = require('path');

var _ohmJs = require('ohm-js');

var _model = require('./model');

var model = _interopRequireWildcard(_model);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var parser;
var semantics;

function parse(str) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (!parser) {
    initParser();
  }
  var mr = parser.match(str);
  if (mr.failed()) {
    if (opts.error) opts.error(mr.message);
    return null;
  } else {
    return semantics(mr).model();
  }
}

/**
 * Loads parser definition and initilizes parser semantics.
 */
function initParser() {
  var recipePath = (0, _path.join)(__dirname, '../ohm/recipe.js');
  var recipe = (0, _fs.readFileSync)(recipePath, 'utf-8');
  // this is the recommended way of loading a parser
  parser = (0, _ohmJs.makeRecipe)(eval(recipe)); // eslint-disable-line

  semantics = parser.createSemantics();
  semantics.addOperation('model', modelActions);
}

var modelActions = {

  // module

  Module_short: function Module_short(imports, expr) {
    return new model.Module(imports.model(), [new model.Const('', expr.model(), true)]);
  },
  Module_long: function Module_long(imports, decls, expr) {
    var declList = decls.model();
    var exprList = expr.model();
    if (exprList.length) declList.push(new model.Const('', exprList[0], true));
    return new model.Module(imports.model(), declList);
  },


  // import

  Import_list: function Import_list(_imp_, _lbr_, items, _rbr_, _from_, moduleSpec) {
    return new model.Import(moduleSpec.model(), items.asIteration().model());
  },
  ImportItem_simple: function ImportItem_simple(id) {
    return new model.ImportItem(id.model(), id.model());
  },


  // declaration

  Declaration_const: function Declaration_const(_const_, id, _eq_, expr) {
    return new model.Const(id.model(), expr.model(), false);
  },
  Declaration_export_const: function Declaration_export_const(_exp_, _const_, id, _eq_, expr) {
    return new model.Const(id.model(), expr.model(), true);
  },
  Declaration_export_default: function Declaration_export_default(_exp_, _def_, expr) {
    return new model.Const('', expr.model(), true);
  },


  // expression

  LogicalOr: function LogicalOr(list) {
    var items = list.asIteration().model();
    if (items.length === 1) {
      return items[0];
    } else {
      return new model.LogicalOr(items);
    }
  },
  LogicalAnd: function LogicalAnd(list) {
    var items = list.asIteration().model();
    if (items.length === 1) {
      return items[0];
    } else {
      return new model.LogicalAnd(items);
    }
  },
  LogicalNot: function LogicalNot(list, expr) {
    if (list.model().length % 2 === 1) {
      return new model.LogicalNot(expr.model());
    } else {
      return expr.model();
    }
  },
  Grouping: function Grouping(_lp_, expr, _rp_) {
    return expr.model();
  },
  ChainedCall: function ChainedCall(list) {
    var calls = list.asIteration().model();
    if (calls.length === 1) {
      return calls[0];
    } else {
      return new model.ChainedCall(calls);
    }
  },
  Call: function Call(id, argsOpt) {
    argsOpt = argsOpt.model();
    var args = argsOpt.length ? argsOpt[0] : [];
    return new model.Call(id.model(), args);
  },
  Object: function Object(_lb_, props, _rb_) {
    return new model.Object_(props.asIteration().model());
  },
  Array: function Array(_lb_, items, _rb_) {
    return new model.Array_(items.asIteration().model());
  },
  String: function String(str) {
    return new model.Literal(str.model());
  },


  // helpers

  ArgumentList: function ArgumentList(_lp_, args, _rp_) {
    return args.asIteration().model();
  },
  Property: function Property(name, _colon_, value) {
    return new model.Property(name);
  },


  // lexical rules

  identifier: function identifier(start, rest) {
    return this.source.contents;
  },
  number: function number(sign, int, _point_, frac, exp) {
    return new model.Literal(parseFloat(this.source.contents));
  },
  string: function string(quote1, chars, quote2) {
    return chars.source.contents;
  },
  regexp: function regexp(slash1, body, slash2) {
    return new model.RegExp(new RegExp(body.source.contents));
  },
  constant_null: function constant_null(_null_) {
    return new model.Literal(null);
  },
  constant_true: function constant_true(_true_) {
    return new model.Literal(true);
  },
  constant_false: function constant_false(_false_) {
    return new model.Literal(false);
  }
};
//# sourceMappingURL=parser.js.map