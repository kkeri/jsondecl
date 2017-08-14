'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Module = exports.Module = function () {
  function Module(imports, decls, value) {
    _classCallCheck(this, Module);

    this.imports = imports;
    this.decls = decls;
    this.value = value;
  }

  _createClass(Module, [{
    key: 'compile',
    value: function compile(cc) {}
  }]);

  return Module;
}();

var Import = exports.Import = function Import(moduleSpec, importList) {
  _classCallCheck(this, Import);

  this.moduleSpec = moduleSpec;
  this.importList = importList;
};

var Const = exports.Const = function Const(id, value, exported) {
  _classCallCheck(this, Const);

  this.id = id;
  this.value = value;
  this.exported = exported;
};

// expression

var Expression = exports.Expression = function () {
  function Expression() {
    _classCallCheck(this, Expression);

    if (new.target === Expression) {
      throw new Error('can\'t instantiate abstract class');
    }
  }

  _createClass(Expression, [{
    key: 'eval',
    value: function _eval() {
      throw new Error('can\'t call abstract method');
    }
  }, {
    key: 'match',
    value: function match(value) {
      throw new Error('can\'t call abstract method');
    }
  }]);

  return Expression;
}();

var LogicalOr = exports.LogicalOr = function (_Expression) {
  _inherits(LogicalOr, _Expression);

  function LogicalOr(items) {
    _classCallCheck(this, LogicalOr);

    var _this = _possibleConstructorReturn(this, (LogicalOr.__proto__ || Object.getPrototypeOf(LogicalOr)).call(this));

    _this.items = items;
    return _this;
  }

  _createClass(LogicalOr, [{
    key: 'eval',
    value: function _eval() {
      throw new Error('invalid model: a logical operator can\'t be chained');
    }
  }, {
    key: 'match',
    value: function match(value) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.items[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;

          if (item.match(value)) {
            return true;
          }
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

      return false;
    }
  }, {
    key: 'bind',
    value: function bind(module) {}
  }]);

  return LogicalOr;
}(Expression);

var LogicalAnd = exports.LogicalAnd = function (_Expression2) {
  _inherits(LogicalAnd, _Expression2);

  function LogicalAnd(items) {
    _classCallCheck(this, LogicalAnd);

    var _this2 = _possibleConstructorReturn(this, (LogicalAnd.__proto__ || Object.getPrototypeOf(LogicalAnd)).call(this));

    _this2.items = items;
    return _this2;
  }

  _createClass(LogicalAnd, [{
    key: 'eval',
    value: function _eval() {
      throw new Error('invalid model: a logical operator can\'t be chained');
    }
  }, {
    key: 'match',
    value: function match(value) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.items[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var item = _step2.value;

          if (!item.match(value)) {
            return false;
          }
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

      return true;
    }
  }, {
    key: 'bind',
    value: function bind(module) {}
  }]);

  return LogicalAnd;
}(Expression);

var ChainedCall = exports.ChainedCall = function (_Expression3) {
  _inherits(ChainedCall, _Expression3);

  function ChainedCall(calls) {
    _classCallCheck(this, ChainedCall);

    var _this3 = _possibleConstructorReturn(this, (ChainedCall.__proto__ || Object.getPrototypeOf(ChainedCall)).call(this));

    _this3.calls = calls;
    return _this3;
  }

  _createClass(ChainedCall, [{
    key: 'eval',
    value: function _eval() {
      throw new Error('invalid model: a ChainedCall can\'t be chained');
    }
  }, {
    key: 'match',
    value: function match(value) {
      var max = this.calls.length - 1;
      for (var i = 0; i < max; i++) {
        value = this.calls[i].eval(value);
      }
      return this.calls[max].validate(value);
    }
  }, {
    key: 'bind',
    value: function bind(module) {}
  }]);

  return ChainedCall;
}(Expression);

var Call = exports.Call = function (_Expression4) {
  _inherits(Call, _Expression4);

  function Call(id, args) {
    _classCallCheck(this, Call);

    var _this4 = _possibleConstructorReturn(this, (Call.__proto__ || Object.getPrototypeOf(Call)).call(this));

    _this4.id = id;
    _this4.args = args;
    return _this4;
  }

  _createClass(Call, [{
    key: 'eval',
    value: function _eval() {
      return this.value;
    }
  }, {
    key: 'match',
    value: function match(value) {
      this.source.eval();
    }
  }, {
    key: 'bind',
    value: function bind(module) {}
  }]);

  return Call;
}(Expression);

var NativeCall = exports.NativeCall = function (_Expression5) {
  _inherits(NativeCall, _Expression5);

  function NativeCall(func, args) {
    _classCallCheck(this, NativeCall);

    var _this5 = _possibleConstructorReturn(this, (NativeCall.__proto__ || Object.getPrototypeOf(NativeCall)).call(this));

    _this5.func = func;
    _this5.args = args;
    return _this5;
  }

  _createClass(NativeCall, [{
    key: 'eval',
    value: function _eval() {
      return this.func.eval();
    }
  }, {
    key: 'match',
    value: function match(value) {
      this.source.eval();
    }
  }, {
    key: 'bind',
    value: function bind(module) {}
  }]);

  return NativeCall;
}(Expression);

var Object_ = exports.Object_ = function (_Expression6) {
  _inherits(Object_, _Expression6);

  function Object_(properties) {
    _classCallCheck(this, Object_);

    var _this6 = _possibleConstructorReturn(this, (Object_.__proto__ || Object.getPrototypeOf(Object_)).call(this));

    _this6.properties = properties;
    for (var i = 0; i < properties.length; i++) {
      properties[i].index = i;
    }
    return _this6;
  }

  _createClass(Object_, [{
    key: 'match',
    value: function match(value) {
      if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object' || value === null) {
        return false;
      }
      var occ = new Array(this.properties.length).fill(0);
      // this should be optimized to be nearly linear
      // tip: most property names will be simply strings
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = Object.getOwnPropertyNames(value)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var name = _step3.value;

          var match = false;
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = this.properties[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var prop = _step5.value;

              if (prop.name.match(name) && prop.value.match(value[name])) {
                match = true;
                occ[prop.index]++;
              }
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

          if (!match) {
            return false;
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

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = this.properties[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var _prop = _step4.value;

          if (occ[_prop.index] < _prop.minCount || occ[_prop.index] > _prop.maxCount) {
            return false;
          }
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

      return true;
    }
  }, {
    key: 'bind',
    value: function bind(module) {}
  }]);

  return Object_;
}(Expression);

var Array_ = exports.Array_ = function (_Expression7) {
  _inherits(Array_, _Expression7);

  function Array_(items) {
    _classCallCheck(this, Array_);

    var _this7 = _possibleConstructorReturn(this, (Array_.__proto__ || Object.getPrototypeOf(Array_)).call(this));

    _this7.items = items;
    return _this7;
  }

  _createClass(Array_, [{
    key: 'match',
    value: function match(value) {
      if (!Array.isArray(value)) {
        return false;
      }
      var vidx = 0;
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this.items[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var item = _step6.value;

          var o = 0;
          while (o < item.maxCount && vidx < value.length && item.match(value[vidx++])) {
            o++;
          }
          if (o < item.minCount) {
            return false;
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

      return true;
    }
  }, {
    key: 'bind',
    value: function bind(module) {}
  }]);

  return Array_;
}(Expression);

// helpers

var Property = exports.Property = function (_Expression8) {
  _inherits(Property, _Expression8);

  function Property(name, value, minCount, maxCount) {
    _classCallCheck(this, Property);

    var _this8 = _possibleConstructorReturn(this, (Property.__proto__ || Object.getPrototypeOf(Property)).call(this));

    _this8.name = name;
    _this8.value = value;
    _this8.minCount = minCount || 1;
    _this8.maxCount = maxCount || 1;
    return _this8;
  }

  return Property;
}(Expression);

var ListItem = exports.ListItem = function (_Expression9) {
  _inherits(ListItem, _Expression9);

  function ListItem(value) {
    _classCallCheck(this, ListItem);

    var _this9 = _possibleConstructorReturn(this, (ListItem.__proto__ || Object.getPrototypeOf(ListItem)).call(this));

    _this9.value = value;
    return _this9;
  }

  return ListItem;
}(Expression);

// leaf nodes

var Identifier = exports.Identifier = function (_Expression10) {
  _inherits(Identifier, _Expression10);

  function Identifier(name) {
    _classCallCheck(this, Identifier);

    var _this10 = _possibleConstructorReturn(this, (Identifier.__proto__ || Object.getPrototypeOf(Identifier)).call(this));

    _this10.name = name;
    return _this10;
  }

  _createClass(Identifier, [{
    key: 'bind',
    value: function bind() {
      return this;
    }
  }]);

  return Identifier;
}(Expression);

var Literal = exports.Literal = function (_Expression11) {
  _inherits(Literal, _Expression11);

  function Literal(value) {
    _classCallCheck(this, Literal);

    var _this11 = _possibleConstructorReturn(this, (Literal.__proto__ || Object.getPrototypeOf(Literal)).call(this));

    _this11.evaluable = false;
    return _this11;
  }

  _createClass(Literal, [{
    key: 'eval',
    value: function _eval() {
      return this.value;
    }
  }, {
    key: 'match',
    value: function match(value) {
      return this.value === value;
    }
  }, {
    key: 'bind',
    value: function bind() {
      return this;
    }
  }]);

  return Literal;
}(Expression);

var Regexp = exports.Regexp = function (_Expression12) {
  _inherits(Regexp, _Expression12);

  function Regexp(regexp) {
    _classCallCheck(this, Regexp);

    var _this12 = _possibleConstructorReturn(this, (Regexp.__proto__ || Object.getPrototypeOf(Regexp)).call(this));

    _this12.regexp = regexp;
    _this12.evaluable = false;
    return _this12;
  }

  _createClass(Regexp, [{
    key: 'match',
    value: function match(value) {
      return this.regexp.test(value);
    }
  }, {
    key: 'bind',
    value: function bind() {
      return this;
    }
  }]);

  return Regexp;
}(Expression);
//# sourceMappingURL=model.js.map