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

test('const', t => {
  t.match(compile('const default = 1'), null)
  t.match(compile('const import = 1'), null)
  t.match(compile('const as = 1'), null)
  t.match(compile('consta = 1'), null)
  t.match(compile('exportconst a = 1'), null)
  t.match(compile('export consta = 1'), null)
  t.done()
})

test('comments and line breaks', t => {
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
