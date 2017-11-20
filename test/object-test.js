'use strict'

const test = require('tap').test
const _compile = require('../lib/index').compile
const model = require('../lib/model')
const RuntimeError = require('../lib/diag').RuntimeError

function compile (str) {
  return _compile(str, {
    filename: __filename
  })
}

test('object', t => {
  t.match(compile('{}').test(3), false)
  t.match(compile('{}').test({}), true)
  t.match(compile('{}').test([]), false)
  t.match(compile('{}').test(/a/), true)
  t.match(compile('{ "length": any }').test([]), false)

  t.match(compile('{ "a": "b" }').test({}), false)
  t.match(compile('{ "a": "b" }').test({ b: 'b' }), false)
  t.match(compile('{ "a": "b" }').test({ a: 'c' }), false)
  t.match(compile('{ "a": "b" }').test({ a: 'b' }), true)

  t.match(compile('{ "a" | "b" : "b" }').test({ a: 'b' }), true)
  t.match(compile('{ "a" | "b" : "b" }').test({ b: 'b' }), true)
  t.match(compile('{ "a" | "b" : "b" }').test({ c: 'b' }), false)
  t.match(compile('{ "a" : "b" | "c" }').test({ a: 'a' }), false)
  t.match(compile('{ "a" : "b" | "c" }').test({ a: 'b' }), true)
  t.match(compile('{ "a" : "b" | "c" }').test({ a: 'c' }), true)

  t.match(compile('{ "a" : "b" }').test({ a: 'b', b: 'b' }), true)
  t.match(compile('{ "a" : "b", any: any }').test({ a: 'b', b: 'b' }), true)
  t.match(compile('{ "a" | "b" : "b" }').test({ a: 'b', b: 'b' }), true)

  t.match(compile('{ "a": any }').test({ a: 1 }), true)
  t.match(compile('{ "a": number }').test({ a: 1 }), true)
  t.match(compile('{ "a": number }').test({ a: 'b' }), false)

  t.match(compile('{ any: 1 }').test({ a: 1, b: 1 }), true)
  t.match(compile('{ any: 1 }').test({ a: 1, b: 2 }), false)
  t.match(compile('{ any: number }').test({ a: 1, b: 2 }), true)
  t.match(compile('{ any: number }').test({ a: 1, b: null }), false)
  t.match(compile('{ any: any }').test({ a: 'b', b: 'b' }), true)
  t.done()
})

test('symbolic cardinality', t => {
  t.match(compile('{ /a/- }').test({}), true)
  t.match(compile('{ /a/- }').test({ b: 1 }), true)
  t.match(compile('{ /a/- }').test({ a: 'x' }), false)
  t.match(compile('{ /a/- }').test({ a: 1 }), false)
  t.match(compile('{ /a/- }').test({ ab: 1, ac: 1 }), false)
  t.match(compile('{ /a/- }').test({ a: 1, b: 1 }), false)

  t.match(compile('{ /a/-: number }').test({}), true)
  t.match(compile('{ /a/-: number }').test({ b: 1 }), true)
  t.match(compile('{ /a/-: number }').test({ a: 'x' }), false)
  t.match(compile('{ /a/-: number }').test({ a: 1 }), false)
  t.match(compile('{ /a/-: number }').test({ ab: 1, ac: 1 }), false)
  t.match(compile('{ /a/-: number }').test({ a: 1, b: 1 }), false)

  t.match(compile('{ /a/?: number }').test({}), true)
  t.match(compile('{ /a/?: number }').test({ b: 1 }), true)
  t.match(compile('{ /a/?: number }').test({ a: 'x' }), false)
  t.match(compile('{ /a/?: number }').test({ a: 1 }), true)
  t.match(compile('{ /a/?: number }').test({ ab: 1, ac: 1 }), false)
  t.match(compile('{ /a/?: number }').test({ a: 1, b: 1 }), true)
  t.match(compile('{ /a/?: number }').test({ ab: 1, ac: 'x' }), false)

  t.match(compile('{ /a/*: number }').test({}), true)
  t.match(compile('{ /a/*: number }').test({ b: 1 }), true)
  t.match(compile('{ /a/*: number }').test({ a: 'x' }), false)
  t.match(compile('{ /a/*: number }').test({ a: 1 }), true)
  t.match(compile('{ /a/*: number }').test({ ab: 1, ac: 1 }), true)
  t.match(compile('{ /a/*: number }').test({ a: 1, b: 1 }), true)
  t.match(compile('{ /a/*: number }').test({ ab: 1, ac: 'x' }), false)

  t.match(compile('{ /a/+: number }').test({}), false)
  t.match(compile('{ /a/+: number }').test({ b: 1 }), false)
  t.match(compile('{ /a/+: number }').test({ a: 'x' }), false)
  t.match(compile('{ /a/+: number }').test({ a: 1 }), true)
  t.match(compile('{ /a/+: number }').test({ ab: 1, ac: 1 }), true)
  t.match(compile('{ /a/+: number }').test({ a: 1, b: 1 }), true)
  t.match(compile('{ /a/+: number }').test({ ab: 1, ac: 'x' }), false)

  t.done()
})

test('numeric cardinality', t => {
  t.match(compile('{ /a/{0}: number }').test({}), true)
  t.match(compile('{ /a/{0}: number }').test({ b: 1 }), true)
  t.match(compile('{ /a/{0}: number }').test({ a: 'x' }), false)
  t.match(compile('{ /a/{0}: number }').test({ a: 1 }), false)
  t.match(compile('{ /a/{0}: number }').test({ ab: 1, ac: 1 }), false)
  t.match(compile('{ /a/{0}: number }').test({ a: 1, b: 1 }), false)

  t.match(compile('{ /a/{1}: number }').test({}), false)
  t.match(compile('{ /a/{1}: number }').test({ b: 1 }), false)
  t.match(compile('{ /a/{1}: number }').test({ a: 'x' }), false)
  t.match(compile('{ /a/{1}: number }').test({ a: 1 }), true)
  t.match(compile('{ /a/{1}: number }').test({ ab: 1, ac: 1 }), false)
  t.match(compile('{ /a/{1}: number }').test({ a: 1, b: 1 }), true)

  t.match(compile('{ /a/{1,}: number }').test({}), false)
  t.match(compile('{ /a/{1,}: number }').test({ b: 1 }), false)
  t.match(compile('{ /a/{1,}: number }').test({ a: 'x' }), false)
  t.match(compile('{ /a/{1,}: number }').test({ a: 1 }), true)
  t.match(compile('{ /a/{1,}: number }').test({ ab: 1, ac: 1 }), true)
  t.match(compile('{ /a/{1,}: number }').test({ ab: 1, ac: 1, ad: 1 }), true)
  t.match(compile('{ /a/{1,}: number }').test({ a: 1, b: 1 }), true)
  t.match(compile('{ /a/{1,}: number }').test({ ab: 1, ac: 'x' }), false)

  t.match(compile('{ /a/{1,2}: number }').test({}), false)
  t.match(compile('{ /a/{1,2}: number }').test({ b: 1 }), false)
  t.match(compile('{ /a/{1,2}: number }').test({ a: 'x' }), false)
  t.match(compile('{ /a/{1,2}: number }').test({ a: 1 }), true)
  t.match(compile('{ /a/{1,2}: number }').test({ ab: 1, ac: 1 }), true)
  t.match(compile('{ /a/{1,2}: number }').test({ ab: 1, ac: 1, ad: 1 }), false)
  t.match(compile('{ /a/{1,2}: number }').test({ a: 1, b: 1 }), true)
  t.match(compile('{ /a/{1,2}: number }').test({ ab: 1, ac: 'x' }), false)

  t.done()
})

test('closed object', t => {
  t.match(compile('closed({ "a": 1 })').test({}), false)
  t.match(compile('closed({ "a": 1 })').test({ a: 'x' }), false)
  t.match(compile('closed({ "a": 1 })').test({ b: 1 }), false)
  t.match(compile('closed({ "a": 1 })').test({ a: 1 }), true)
  t.match(compile('closed({ "a": 1 })').test({ a: 1, b: 1 }), false)

  t.match(compile('closed({ "a": 1 } | { "b": 2 })').test({}), false)
  t.match(compile('closed({ "a": 1 } | { "b": 2 })').test({ a: 'x' }), false)
  t.match(compile('closed({ "a": 1 } | { "b": 2 })').test({ a: 1 }), true)
  t.match(compile('closed({ "a": 1 } | { "b": 2 })').test({ b: 2 }), true)
  t.match(compile('closed({ "a": 1 } | { "b": 2 })').test({ a: 1, b: 2 }), true)
  t.match(compile('closed({ "a": 1 } | { "b": 2 })').test({ a: 1, b: 2, c: 3 }), false)

  t.match(compile('closed({ "a": 1 } & { "b": 2 })').test({}), false)
  t.match(compile('closed({ "a": 1 } & { "b": 2 })').test({ a: 'x' }), false)
  t.match(compile('closed({ "a": 1 } & { "b": 2 })').test({ a: 1 }), false)
  t.match(compile('closed({ "a": 1 } & { "b": 2 })').test({ b: 2 }), false)
  t.match(compile('closed({ "a": 1 } & { "b": 2 })').test({ a: 1, b: 2 }), true)
  t.match(compile('closed({ "a": 1 } & { "b": 2 })').test({ a: 1, b: 2, c: 3 }), false)

  t.match(compile('closed({ "a": 1 } | { "a": 1 })').test({}), false)
  t.match(compile('closed({ "a": 1 } | { "a": 1 })').test({ a: 'x' }), false)
  t.match(compile('closed({ "a": 1 } | { "a": 1 })').test({ a: 1 }), true)
  t.match(compile('closed({ "a": 1 } | { "a": 1 })').test({ b: 2 }), false)
  t.match(compile('closed({ "a": 1 } | { "a": 1 })').test({ a: 1, b: 2 }), false)
  t.match(compile('closed({ "a": 1 } | { "a": 1 })').test({ a: 1, b: 2, c: 3 }), false)

  t.match(compile('closed({ "a": 1 } & { "a": 1 })').test({}), false)
  t.match(compile('closed({ "a": 1 } & { "a": 1 })').test({ a: 'x' }), false)
  t.match(compile('closed({ "a": 1 } & { "a": 1 })').test({ a: 1 }), true)
  t.match(compile('closed({ "a": 1 } & { "a": 1 })').test({ b: 2 }), false)
  t.match(compile('closed({ "a": 1 } & { "a": 1 })').test({ a: 1, b: 2 }), false)
  t.match(compile('closed({ "a": 1 } & { "a": 1 })').test({ a: 1, b: 2, c: 3 }), false)

  t.match(compile('{ "a": 1 } | closed({ "b": 2 })').test({}), false)
  t.match(compile('{ "a": 1 } | closed({ "b": 2 })').test({ a: 'x' }), false)
  t.match(compile('{ "a": 1 } | closed({ "b": 2 })').test({ a: 1 }), true)
  t.match(compile('{ "a": 1 } | closed({ "b": 2 })').test({ b: 2 }), true)
  t.match(compile('{ "a": 1 } | closed({ "b": 2 })').test({ a: 1, b: 2 }), true)
  t.match(compile('{ "a": 1 } | closed({ "b": 2 })').test({ a: 1, b: 2, c: 3 }), true)
  t.match(compile('{ "a": 1 } | closed({ "b": 2 })').test({ b: 2, c: 3 }), false)

  t.match(compile('{ "a": 1 } & closed({ "b": 2 })').test({}), false)
  t.match(compile('{ "a": 1 } & closed({ "b": 2 })').test({ a: 'x' }), false)
  t.match(compile('{ "a": 1 } & closed({ "b": 2 })').test({ a: 1 }), false)
  t.match(compile('{ "a": 1 } & closed({ "b": 2 })').test({ b: 2 }), false)
  t.match(compile('{ "a": 1 } & closed({ "b": 2 })').test({ a: 1, b: 2 }), false)
  t.match(compile('{ "a": 1 } & closed({ "b": 2 })').test({ a: 1, b: 2, c: 3 }), false)
  t.match(compile('{ "a": 1 } & closed({ "b": 2 })').test({ b: 2, c: 3 }), false)

  t.match(compile('{ "a": 1 } | closed({ "a": 1 })').test({}), false)
  t.match(compile('{ "a": 1 } | closed({ "a": 1 })').test({ a: 'x' }), false)
  t.match(compile('{ "a": 1 } | closed({ "a": 1 })').test({ a: 1 }), true)
  t.match(compile('{ "a": 1 } | closed({ "a": 1 })').test({ b: 2 }), false)
  t.match(compile('{ "a": 1 } | closed({ "a": 1 })').test({ a: 1, b: 2 }), true)
  t.match(compile('{ "a": 1 } | closed({ "a": 1 })').test({ a: 1, b: 2, c: 3 }), true)
  t.match(compile('{ "a": 1 } | closed({ "a": 1 })').test({ b: 2, c: 3 }), false)

  t.match(compile('{ "a": 1 } & closed({ "a": 1 })').test({}), false)
  t.match(compile('{ "a": 1 } & closed({ "a": 1 })').test({ a: 'x' }), false)
  t.match(compile('{ "a": 1 } & closed({ "a": 1 })').test({ a: 1 }), true)
  t.match(compile('{ "a": 1 } & closed({ "a": 1 })').test({ b: 2 }), false)
  t.match(compile('{ "a": 1 } & closed({ "a": 1 })').test({ a: 1, b: 2 }), false)
  t.match(compile('{ "a": 1 } & closed({ "a": 1 })').test({ a: 1, b: 2, c: 3 }), false)
  t.match(compile('{ "a": 1 } & closed({ "a": 1 })').test({ b: 2, c: 3 }), false)

  t.match(compile('closed({ "a": 1 }) | closed({ "b": 2 })').test({}), false)
  t.match(compile('closed({ "a": 1 }) | closed({ "b": 2 })').test({ a: 'x' }), false)
  t.match(compile('closed({ "a": 1 }) | closed({ "b": 2 })').test({ a: 1 }), true)
  t.match(compile('closed({ "a": 1 }) | closed({ "b": 2 })').test({ b: 2 }), true)
  t.match(compile('closed({ "a": 1 }) | closed({ "b": 2 })').test({ a: 1, b: 2 }), false)
  t.match(compile('closed({ "a": 1 }) | closed({ "b": 2 })').test({ a: 1, b: 2, c: 3 }), false)
  t.match(compile('closed({ "a": 1 }) | closed({ "b": 2 })').test({ b: 2, c: 3 }), false)

  t.match(compile('closed({ "a": 1 }) & closed({ "b": 2 })').test({}), false)
  t.match(compile('closed({ "a": 1 }) & closed({ "b": 2 })').test({ a: 'x' }), false)
  t.match(compile('closed({ "a": 1 }) & closed({ "b": 2 })').test({ a: 1 }), false)
  t.match(compile('closed({ "a": 1 }) & closed({ "b": 2 })').test({ b: 2 }), false)
  t.match(compile('closed({ "a": 1 }) & closed({ "b": 2 })').test({ a: 1, b: 2 }), false)
  t.match(compile('closed({ "a": 1 }) & closed({ "b": 2 })').test({ a: 1, b: 2, c: 3 }), false)
  t.match(compile('closed({ "a": 1 }) & closed({ "b": 2 })').test({ b: 2, c: 3 }), false)

  t.done()
})

test('closed expression', t => {
  t.throws(function () { compile('closed()').test({}) }, RuntimeError)

  t.match(compile('closed(1)').test({}), false)
  t.match(compile('closed(1)').test(1), true)

  t.match(compile('closed(1 | { "a": 1 })').test(1), true)
  t.match(compile('closed(1 | { "a": 1 })').test({}), false)
  t.match(compile('closed(1 | { "a": 1 })').test({ a: 'x' }), false)
  t.match(compile('closed(1 | { "a": 1 })').test({ b: 1 }), false)
  t.match(compile('closed(1 | { "a": 1 })').test({ a: 1 }), true)
  t.match(compile('closed(1 | { "a": 1 })').test({ a: 1, b: 1 }), false)

  t.done()
})

test('closed nested object', t => {
  t.match(compile('closed({ "a": { "b": 2 } })').test({}), false)
  t.match(compile('closed({ "a": { "b": 2 } })').test({ a: 'x' }), false)
  t.match(compile('closed({ "a": { "b": 2 } })').test({ b: 2 }), false)
  t.match(compile('closed({ "a": { "b": 2 } })').test({ a: { b: 2 } }), true)
  t.match(compile('closed({ "a": { "b": 2 } })').test({ a: { b: 2, c: 1 } }), true)
  t.match(compile('closed({ "a": { "b": 2 } })').test({ a: 1, b: 1 }), false)

  t.match(compile('closed({ "a": closed({ "b": 2 }) })').test({}), false)
  t.match(compile('closed({ "a": closed({ "b": 2 }) })').test({ a: 'x' }), false)
  t.match(compile('closed({ "a": closed({ "b": 2 }) })').test({ b: 2 }), false)
  t.match(compile('closed({ "a": closed({ "b": 2 }) })').test({ a: { b: 2 } }), true)
  t.match(compile('closed({ "a": closed({ "b": 2 }) })').test({ a: { b: 2, c: 1 } }), false)
  t.match(compile('closed({ "a": closed({ "b": 2 }) })').test({ a: 1, b: 1 }), false)

  t.done()
})
