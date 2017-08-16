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
    this.envStack = [];
    this.currentBlock = undefined;
  }

  _createClass(CompilerContext, [{
    key: 'enter',
    value: function enter(block) {
      this.envStack.push(this.currentBlock);
      this.currentBlock = block;
    }
  }, {
    key: 'leave',
    value: function leave() {
      this.currentBlock = this.envStack.pop();
    }
  }, {
    key: 'lookup',
    value: function lookup(id) {
      var decl = this.currentBlock.decls[id];
      if (!decl) {
        this.error(id + ': undeclared identifier');
      } else {
        return decl;
      }
    }
  }, {
    key: 'declare',
    value: function declare(id, expr, exported) {
      if (!id) {
        if (this.module.defaultExport) {
          this.error('duplicate default export');
        } else {
          this.module.defaultExport = expr;
        }
      } else if (id in this.currentBlock.decls) {
        this.error(id + ': duplicate identifier');
      } else {
        this.currentBlock.decls[id] = expr;
        if (exported) {
          this.module.exports[id] = expr;
        }
      }
    }
  }, {
    key: 'buildScope',
    value: function buildScope(node) {
      var method = _buildScope[node.constructor.name];
      if (method) method.call(node, this);
    }
  }, {
    key: 'bind',
    value: function bind(node) {
      var method = _bind[node.constructor.name];
      if (method) {
        return method.call(node, this);
      } else {
        return node;
      }
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
  }]);

  return CompilerContext;
}();

var _buildScope = {
  Module: function Module(cc) {
    cc.enter(this.decls);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.importList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var import_ = _step.value;

        cc.buildScope(import_);
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

        cc.buildScope(decl);
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

    cc.leave();
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
          cc.error(item.origId + ': identifier not defined in module ' + ('\'' + this.moduleSpec + '\''));
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
    cc.declare(this.id, this, this.exported);
    cc.buildScope(this.value);
  },
  LogicalOr: function LogicalOr(cc) {
    this.items.forEach(function (i) {
      return cc.buildScope(i);
    });
  },
  LogicalAnd: function LogicalAnd(cc) {
    this.items.forEach(function (i) {
      return cc.buildScope(i);
    });
  },
  ChainedCall: function ChainedCall(cc) {
    this.calls.forEach(function (i) {
      return cc.buildScope(i);
    });
  },
  Call: function Call(cc) {
    this.args.forEach(function (i) {
      return cc.buildScope(i);
    });
  }
};

var _bind = {
  Module: function Module(cc) {
    cc.enter(this.decls);
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = this.importList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var import_ = _step4.value;

        cc.buildScope(import_);
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = this.declList[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var decl = _step5.value;

        decl.buildScope(cc);
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5.return) {
          _iterator5.return();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }

    cc.leave();
    return this;
  },
  Import: function Import(cc) {
    var module = require(this.moduleSpec);
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = this.importList[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        var item = _step6.value;

        if (item.origId in module) {
          cc.declare(item.localId, cc.compileImportExpression(module[item.origId]));
        } else {
          cc.error(item.origId + ': identifier not defined in module ' + ('\'' + this.moduleSpec + '\''));
        }
      }
    } catch (err) {
      _didIteratorError6 = true;
      _iteratorError6 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion6 && _iterator6.return) {
          _iterator6.return();
        }
      } finally {
        if (_didIteratorError6) {
          throw _iteratorError6;
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
  },
  Call: function Call(cc) {
    this.calls = this.calls.map(function (i) {
      return cc.compile(i);
    });
    return this;
  }
};
//# sourceMappingURL=compiler.js.map