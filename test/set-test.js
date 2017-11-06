'use strict'

const test = require('tap').test
const _compile = require('../lib/index').compile
const model = require('../lib/model')

function compile(str) {
  return _compile(str, {
    filename: __filename
  })
}

test('uniqueness', t => {
  t.match(compile('const s = set; 1').test(1), true)
  t.match(compile('const s = 1; { "a": unique(s) }').test({ a: 1 }), false)
  t.match(compile('const s = set; { "a": unique(s) }').test({ a: 1 }), true)
  t.match(compile('const s = set; { "a": unique(s), "b": unique(s) }')
  .test({ a: 1, b: 1 }), false)
  t.match(compile('const s = set; { "a": unique(s), "b": unique(s) }')
  .test({ a: 1, b: 2 }), true)
  t.match(compile('const s = set; { "a": unique(s), "c": any } | { "b": unique(s) }')
  .test({ a: 1, b: 1 }), true)
  t.match(compile('const s = set; { "a": unique(s) } | { "a": unique(s) }')
  .test({ a: 1 }), true)
  t.match(compile('const s = set; { "a": unique(s) } & { "a": unique(s) }')
  .test({ a: 1 }), true)

  t.done()
})

test('set inclusion', t => {
  t.match(compile('const s = set; elementof(s)').test(1), false)
  t.match(compile('const s = 1; elementof(s)').test(1), false)
  t.match(compile('const s = set; unique(s) & elementof(s)').test(1), true)
  t.match(compile('const s = set; elementof(s) & unique(s)').test(1), false)
  t.match(compile('const s = set; { "a": unique(s) } & { "b": elementof(s) }')
  .test({ a: 9, b: 9 }), true)
  t.match(compile('const s = set; { "a": unique(s) } & { "b": elementof(s) }')
  .test({ a: 9, b: 7 }), false)

  t.done()
})
