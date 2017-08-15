'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.compile = compile;

var _parser = require('./parser');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function compile(str) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var module = (0, _parser.parse)(str);
  if (!module) return null;
  var cc = new CompilerContext(module, opts);
  cc.compile(module);
  return cc.errors === 0 ? module : null;
}

var CompilerContext = function () {
  function CompilerContext(module, opts) {
    _classCallCheck(this, CompilerContext);

    this.module = module;
    this.opts = opts;
    this.errors = 0;
  }

  _createClass(CompilerContext, [{
    key: 'compile',
    value: function compile(node) {
      return methods[node.constructor.name](this);
    }
  }, {
    key: 'compileImportExpression',
    value: function compileImportExpression(expr) {
      // todo: check type of import and handle accordingly
      return expr;
    }
  }, {
    key: 'error',
    value: function error(msg) {
      this.errors++;
      this.opts.error && this.opts.error(msg);
    }
  }, {
    key: 'declare',
    value: function declare(id, expr, exported) {
      if (id in this.module.decls) {
        this.error(id + ': duplicate identifier');
      } else {
        this.module.decls[id] = expr;
        if (exported) {
          this.module.exports[id] = expr;
        }
      }
    }
  }]);

  return CompilerContext;
}();

var methods = {
  Module: function Module(cc) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.importList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var import_ = _step.value;

        import_.compile(cc);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = this.declList[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var decl = _step2.value;

        decl.compile(cc);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return this;
  },
  Import: function Import(cc) {
    var module = require(this.moduleSpec);
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = this.importList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var item = _step3.value;

        if (item.origId in module) {
          cc.declare(item.localId, cc.compileImportExpression(module[item.origId]));
        } else {
          cc.error(item.origId + ': identifier not defined in module \'' + this.moduleSpec);
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }
  },
  Const: function Const(cc) {
    cc.declare(this.id, cc.compile(this.value), this.exported);
  },
  LogicalOr: function LogicalOr(cc) {
    this.items = this.items.map(function (i) {
      return cc.compile(i);
    });
    return this;
  },
  LogicalAnd: function LogicalAnd(cc) {
    this.items = this.items.map(function (i) {
      return cc.compile(i);
    });
    return this;
  },
  ChainedCall: function ChainedCall(cc) {
    this.calls = this.calls.map(function (i) {
      return cc.compile(i);
    });
    return this;
  }
};
//# sourceMappingURL=compiler.js.map