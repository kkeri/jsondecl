'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.compile = compile;

var _parser = require('./parser');

var _path = require('path');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function compile(str) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var module = (0, _parser.parse)(str, {
    error: opts.error
  });
  if (!module) return null;
  var cc = new CompilerContext(module, {
    error: opts.error || function () {},
    importPath: (0, _path.dirname)(opts.filename)
  });
  cc.buildBlock(module);
  if (cc.errors) return null;
  cc.bind(module);
  if (cc.errors) return null;
  return module;
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
      if (decl) {
        return decl.body;
      } else {
        this.error(id + ': undeclared identifier');
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
    key: 'buildBlock',
    value: function buildBlock(node) {
      var method = _buildBlock[node.constructor.name];
      if (method) method.call(node, this);
    }
  }, {
    key: 'bind',
    value: function bind(node) {
      var method = _bind[node.constructor.name];
      if (method) method.call(node, this);
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
      this.opts.error(msg);
    }
  }]);

  return CompilerContext;
}();

var _buildBlock = {
  Module: function Module(cc) {
    cc.enter(this);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.importList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var import_ = _step.value;

        cc.buildBlock(import_);
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

        cc.buildBlock(decl);
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
    if (!cc.opts.importPath) {
      cc.error('using import requires the \'importPath\' option');
      return;
    }
    var donor = require((0, _path.join)(cc.opts.importPath, this.moduleSpec));
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = this.importList[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var item = _step3.value;

        if (item.originalId in donor) {
          cc.declare(item.localId, cc.compileImportExpression(donor[item.originalId]));
        } else {
          cc.error(item.originalId + ': identifier not defined in module ' + ('\'' + this.moduleSpec + '\''));
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
    cc.buildBlock(this.body);
  },
  LogicalOr: function LogicalOr(cc) {
    this.items.forEach(function (i) {
      return cc.buildBlock(i);
    });
  },
  LogicalAnd: function LogicalAnd(cc) {
    this.items.forEach(function (i) {
      return cc.buildBlock(i);
    });
  },
  ChainedCall: function ChainedCall(cc) {
    this.calls.forEach(function (i) {
      return cc.buildBlock(i);
    });
  },
  Call: function Call(cc) {
    this.args.forEach(function (i) {
      return cc.buildBlock(i);
    });
  }
};

var _bind = {
  Module: function Module(cc) {
    cc.enter(this);
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = this.declList[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var decl = _step4.value;

        cc.bind(decl);
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

    cc.leave();
  },
  Const: function Const(cc) {
    cc.bind(this.body);
    return this;
  },
  LogicalOr: function LogicalOr(cc) {
    this.items.forEach(function (i) {
      return cc.bind(i);
    });
  },
  LogicalAnd: function LogicalAnd(cc) {
    this.items.forEach(function (i) {
      return cc.bind(i);
    });
  },
  ChainedCall: function ChainedCall(cc) {
    this.calls.forEach(function (i) {
      return cc.bind(i);
    });
  },
  Call: function Call(cc) {
    this.func = cc.lookup(this.id);
    this.args.forEach(function (i) {
      return cc.bind(i);
    });
  },
  Object_: function Object_(cc) {
    this.properties.forEach(function (i) {
      return cc.bind(i);
    });
  },
  Array_: function Array_(cc) {
    this.items.forEach(function (i) {
      return cc.bind(i);
    });
  },
  Property: function Property(cc) {
    cc.bind(this.name);
    cc.bind(this.value);
  }
};
//# sourceMappingURL=compiler.js.map