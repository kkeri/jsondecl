'use strict'

const test = require('tap').test
const model = require('../lib/model')
const jsondl = require('../lib/index')

function compile (str) {
  let messages = []
  return jsondl.compile(str, {
    baseDir: __dirname,
    messages
  })
}

test('simple value', t => {
  t.match(compile('1'), {
    exports: {
      default: { expr: { value: 1 } }
    }
  })
  t.match(compile('"a"'), {
    exports: {
      default: { expr: { value: 'a' } }
    }
  })
  t.match(compile('true'), {
    exports: {
      default: { expr: { value: true } }
    }
  })
  t.match(compile('false'), {
    exports: {
      default: { expr: { value: false } }
    }
  })
  t.match(compile('null'), {
    exports: {
      default: { expr: { value: null } }
    }
  })
  t.done()
})

test('regex', t => {
  t.notEqual(compile('/a/'), null)
  t.notEqual(compile('/ abc/'), null)
  t.notEqual(compile('/a/i'), null)
  t.equal(compile('/a/g'), null)
  t.notEqual(compile('/\\//i'), null)
  t.notEqual(compile('/\t/'), null)
  t.notEqual(compile('/\\r\\n/'), null)
  t.equal(compile('/a/ghj'), null)
  t.done()
})

test('identifier', t => {
  // t.match(compile('a'), null) <- no runtime check at the time
  t.match(compile('const a = 1; a'), {
    exports: {
      default: { expr: { id: 'a'  } }
    }
  })
  t.done()
})

test('const', t => {
  t.match(compile('const default = 1'), null)
  t.match(compile('const import = 1'), null)
  t.match(compile('const as = 1'), null)
  t.match(compile('consta = 1'), null)
  t.match(compile('exportconst a = 1'), null)
  t.match(compile('export consta = 1'), null)
  t.match(compile('export const a = 1'), {
    env: {
      a: { expr: { value: 1 } }
    },
    exports: {
      a: { expr: { value: 1 } }
    }
  })
  t.match(compile('export const $a = 1'), {
    env: {
      $a: { expr: { value: 1 } }
    },
    exports: {
      $a: { expr: { value: 1 } }
    }
  })
  t.match(compile('export const a = 1; 2'), {
    env: {
      a: { expr: { value: 1 } }
    },
    exports: {
      default: { expr: { value: 2 } },
      a: { expr: { value: 1 } }
    }
  })
  t.match(compile('const a = 1; const a = 2'), null)
  t.match(compile('export const a = 1; const b = 2'), {
    env: {
      a: { expr: { value: 1 } },
      b: { expr: { value: 2 } }
    },
    exports: {
      a: { expr: { value: 1 } }
    }
  })
  t.match(compile('export const a = 1 | 2'), {
    env: {
      a: { expr:
      {
        items: [
            { value: 1 },
            { value: 2 }
        ]
      }
      }
    }
  })
  t.done()
})

test('const with comments', t => {
  t.match(compile('/**/export/**/const/**/a/**/=/**/1/**/'), {
    exports: {
      a: { expr: { value: 1 } }
    }
  })
  t.match(compile('//\rexport//\rconst//\ra//\r=//\r1//\r'), {
    exports: {
      a: { expr: { value: 1 } }
    }
  })
  t.match(compile('export const a = 1;/**/\t //'), {
    exports: {
      a: { expr: { value: 1 } }
    }
  })
  t.done()
})

test('object', t => {
  t.match(compile('{}'), {
    exports: {
      default: { expr: { propertyList: [] } }
    }
  })
  // todo: static analysis
  // t.match(compile('{ a: b }'), null)
  t.match(compile('{ "a": "b" }'), {
    exports: {
      default: { expr: {
        propertyList: [
          {
            name: { value: 'a' },
            value: { value: 'b' }
          }
        ]
      }}
    }
  })
  t.match(compile('{ "a": "b", "c": "d" }'), {
    exports: {
      default: { expr: {
        propertyList: [
          {
            name: { value: 'a' },
            value: { value: 'b' }
          },
          {
            name: { value: 'c' },
            value: { value: 'd' }
          }
        ]
      }}
    }
  })
  t.done()
})

test('valid function call', t => {
  t.match(compile('eq()'), {
    exports: {
      default: { expr: {
        // func: { eval: Function, test: Function },
        args: [
        ]
      }}
    }
  })
  t.match(compile('eq(1)'), {
    exports: {
      default: { expr: {
        // func: { eval: Function, test: Function },
        args: [
          { value: 1 }
        ]
      }}
    }
  })
  t.match(compile('eq(1, 2)'), {
    exports: {
      default: { expr: {
        // func: { eval: Function, test: Function },
        args: [
          { value: 1 },
          { value: 2 }
        ]
      }}
    }
  })
  t.match(compile('closed({})'), {
    exports: {
      default: { expr: {
        // func: { eval: Function, test: Function },
        args: [
          {
            propertyList: []
          }
        ]
      }}
    }
  })
  t.match(compile('closed({ "a": 1 })'), {
    exports: {
      default: { expr: {
        // func: { eval: Function, test: Function },
        args: [
          {
            propertyList: [
              { name: { value: 'a' }, value: { value: 1 } }
            ]
          }
        ]
      }}
    }
  })
  t.done()
})

test('let...in', t => {
  // todo: static analysis
  // t.match(compile('let a = 1 in b'), null)
  t.match(compile('let a = 1 in a'), {
    exports: {
      default: { expr: {
        env: {
          a: { expr: { value: 1 } }
        },
        body: { id: 'a' }
      }}
    }
  })
  t.match(compile('const x = 1; let a = x in a'), {
    exports: {
      default: { expr: {
        env: {
          a: { expr: { id: 'x' } }
        },
        body: { id: 'a' }
      }}
    }
  })
  t.match(compile('export default let a = x in a; const x = 1'), {
    exports: {
      default: { expr: {
        env: {
          a: { expr: { id: 'x' } }
        },
        body: { id: 'a' }
      }}
    }
  })
  t.done()
})

test('compile file', t => {
  t.match(jsondl.load(require.resolve('./module/test.jsondl')), {
    exports: {
      default: { expr: {
        propertyList: [
          { name: { value: 'name' }},
          { name: { value: 'age' }}
        ]
      }}
    }
  })
  t.match(jsondl.load(require.resolve('./module/imports.jsondl')), {
    exports: {
      default: { expr: {
        propertyList: [
          { name: { value: 'name' }},
          { name: { value: 'age' }, value: { id: 'a' }}
        ]
      }}
    }
  })
  t.done()
})
