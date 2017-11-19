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
    defaultExport: {
      value: 1
    }
  })
  t.match(compile('"a"'), {
    defaultExport: {
      value: 'a'
    }
  })
  t.match(compile('true'), {
    defaultExport: {
      value: true
    }
  })
  t.match(compile('false'), {
    defaultExport: {
      value: false
    }
  })
  t.match(compile('null'), {
    defaultExport: {
      value: null
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
    defaultExport: { id: 'a' }
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
      a: { body: { value: 1 } }
    },
    exports: {
      a: { body: { value: 1 } }
    },
    defaultExport: null
  })
  t.match(compile('export const a = 1; 2'), {
    env: {
      a: { body: { value: 1 } }
    },
    exports: {
      a: { body: { value: 1 } }
    },
    defaultExport: { value: 2 }
  })
  t.match(compile('const a = 1; const a = 2'), null)
  t.match(compile('export const a = 1; const b = 2'), {
    env: {
      a: { body: { value: 1 } },
      b: { body: { value: 2 } }
    },
    exports: {
      a: { body: { value: 1 } }
    },
    defaultExport: null
  })
  t.match(compile('export const a = 1 | 2'), {
    env: {
      a: { body:
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
      a: { body: { value: 1 } }
    }
  })
  t.match(compile('//\rexport//\rconst//\ra//\r=//\r1//\r'), {
    exports: {
      a: { body: { value: 1 } }
    }
  })
  t.match(compile('export const a = 1;/**/\t //'), {
    exports: {
      a: { body: { value: 1 } }
    }
  })
  t.done()
})

test('object', t => {
  t.match(compile('{}'), {
    defaultExport: {
      propertyList: []
    }
  })
  // todo: static analysis
  // t.match(compile('{ a: b }'), null)
  t.match(compile('{ "a": "b" }'), {
    defaultExport: {
      propertyList: [
        {
          name: { value: 'a' },
          value: { value: 'b' }
        }
      ]
    }
  })
  t.match(compile('{ "a": "b", "c": "d" }'), {
    defaultExport: {
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
    }
  })
  t.done()
})

test('valid function call', t => {
  t.match(compile('eq()'), {
    defaultExport: {
      // func: { eval: Function, test: Function },
      args: [
      ]
    }
  })
  t.match(compile('eq(1)'), {
    defaultExport: {
      // func: { eval: Function, test: Function },
      args: [
        { value: 1 }
      ]
    }
  })
  t.match(compile('eq(1, 2)'), {
    defaultExport: {
      // func: { eval: Function, test: Function },
      args: [
        { value: 1 },
        { value: 2 }
      ]
    }
  })
  t.match(compile('closed({})'), {
    defaultExport: {
      // func: { eval: Function, test: Function },
      args: [
        {
          propertyList: []
        }
      ]
    }
  })
  t.match(compile('closed({ "a": 1 })'), {
    defaultExport: {
      // func: { eval: Function, test: Function },
      args: [
        {
          propertyList: [
            { name: { value: 'a' }, value: { value: 1 } }
          ]
        }
      ]
    }
  })
  t.done()
})

test('let...in', t => {
  // todo: static analysis
  // t.match(compile('let a = 1 in b'), null)
  t.match(compile('let a = 1 in a'), {
    defaultExport: {
      env: {
        a: { body: { value: 1 } }
      },
      body: { id: 'a' }
    }
  })
  t.match(compile('const x = 1; let a = x in a'), {
    defaultExport: {
      env: {
        a: { body: { id: 'x' } }
      },
      body: { id: 'a' }
    }
  })
  t.match(compile('export default let a = x in a; const x = 1'), {
    defaultExport: {
      env: {
        a: { body: { id: 'x' } }
      },
      body: { id: 'a' }
    }
  })
  t.done()
})

test('compile file', t => {
  t.match(jsondl.load(require.resolve('./module/test.jsondl')), {
    defaultExport: {
      propertyList: [
        { name: { value: 'name' }},
        { name: { value: 'age' }}
      ]
    }
  })
  t.match(jsondl.load(require.resolve('./module/imports.jsondl')), {
    defaultExport: {
      propertyList: [
        { name: { value: 'name' }},
        { name: { value: 'age' }, value: { id: 'a' }}
      ]
    }
  })
  t.done()
})
