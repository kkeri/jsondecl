'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compile = compile;

var _model = require('./model');

var model = _interopRequireWildcard(_model);

var _jsondeclParser = require('jsondecl-parser');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function compile(str) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};


  var cc = {
    decls: opts.declarations || {}
  };
}
//# sourceMappingURL=compiler.js.map