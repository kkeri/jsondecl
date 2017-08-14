'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compile = compile;

var _parser = require('./parser');

function compile(str) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var cc = {
    decls: opts.declarations || {}
  };
  var module = (0, _parser.parse)(str);
  if (!module) return null;
  module.compile(cc);
  return module;
}
//# sourceMappingURL=index.js.map