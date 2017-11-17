'use strict'

const test = require('tap').test
const jsondl = require('../lib/index')
const model = require('../lib/model')

function compile (str) {
  const messages = []
  return jsondl.compile(str, {
    baseDir: __dirname,
    messages
  })
}

test('default export', t => {
  t.match(compile('1').test(1), true)
  t.match(compile('export default 1').test(1), true)
  t.done()
})

test('double default export', t => {
  t.match(compile('1; 2'), null)
  t.match(compile('export default 1; 2'), null)
  t.match(compile('export default 1; export default 2'), null)
  t.done()
})

test('export const default', t => {
  t.match(compile('const default = 1; export default'), null)
  t.done()
})

test('const with terminator', t => {
  t.match(compile('export const a = 1;/**/'), {
    exports: {
      a: { body: { value: 1 } }
    }
  })
  t.match(compile('export const a = 1;//'), {
    exports: {
      a: { body: { value: 1 } }
    }
  })
  t.match(compile('export const a = 1/**/;'), {
    exports: {
      a: { body: { value: 1 } }
    }
  })
  t.match(compile('export const a = 1/**/\r;'), {
    exports: {
      a: { body: { value: 1 } }
    }
  })
  t.match(compile('export const a = 1//\r;'), {
    exports: {
      a: { body: { value: 1 } }
    }
  })
  t.match(compile('export const a = 1\r;'), {
    exports: {
      a: { body: { value: 1 } }
    }
  })
  t.match(compile('export const a = 1\r \n '), {
    exports: {
      a: { body: { value: 1 } }
    }
  })
  t.done()
})

test('no export', t => {
  t.match(compile('const a = 1'), null)
  t.done()
})
