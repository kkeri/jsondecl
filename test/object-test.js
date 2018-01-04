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
  t.match(compile('{}').match(3), false)
  t.match(compile('{}').match({}), true)
  t.match(compile('{}').match([]), false)
  t.match(compile('{}').match(/a/), true)
  t.match(compile('{ "length": any }').match([]), false)

  t.match(compile('{ "a": "b" }').match({}), false)
  t.match(compile('{ "a": "b" }').match({ b: 'b' }), false)
  t.match(compile('{ "a": "b" }').match({ a: 'c' }), false)
  t.match(compile('{ "a": "b" }').match({ a: 'b' }), true)

  t.match(compile('{ "a" | "b" : "b" }').match({ a: 'b' }), true)
  t.match(compile('{ "a" | "b" : "b" }').match({ b: 'b' }), true)
  t.match(compile('{ "a" | "b" : "b" }').match({ c: 'b' }), false)
  t.match(compile('{ "a" : "b" | "c" }').match({ a: 'a' }), false)
  t.match(compile('{ "a" : "b" | "c" }').match({ a: 'b' }), true)
  t.match(compile('{ "a" : "b" | "c" }').match({ a: 'c' }), true)

  t.match(compile('{ "a" : "b" }').match({ a: 'b', b: 'b' }), true)
  t.match(compile('{ "a" : "b", any: any }').match({ a: 'b', b: 'b' }), true)
  t.match(compile('{ "a" | "b" : "b" }').match({ a: 'b', b: 'b' }), true)

  t.match(compile('{ "a": any }').match({ a: 1 }), true)
  t.match(compile('{ "a": number }').match({ a: 1 }), true)
  t.match(compile('{ "a": number }').match({ a: 'b' }), false)

  t.match(compile('{ any: 1 }').match({ a: 1, b: 1 }), true)
  t.match(compile('{ any: 1 }').match({ a: 1, b: 2 }), false)
  t.match(compile('{ any: number }').match({ a: 1, b: 2 }), true)
  t.match(compile('{ any: number }').match({ a: 1, b: null }), false)
  t.match(compile('{ any: any }').match({ a: 'b', b: 'b' }), true)
  t.done()
})

test('symbolic cardinality', t => {
  t.match(compile('{ /a/ }').match({}), false)
  t.match(compile('{ /a/ }').match({ b: 1 }), false)
  t.match(compile('{ /a/ }').match({ a: 'x' }), true)
  t.match(compile('{ /a/ }').match({ a: 1 }), true)
  t.match(compile('{ /a/ }').match({ ab: 1, ac: 1 }), true)
  t.match(compile('{ /a/ }').match({ a: 1, b: 1 }), true)

  t.match(compile('{ /a/- }').match({}), true)
  t.match(compile('{ /a/- }').match({ b: 1 }), true)
  t.match(compile('{ /a/- }').match({ a: 'x' }), false)
  t.match(compile('{ /a/- }').match({ a: 1 }), false)
  t.match(compile('{ /a/- }').match({ ab: 1, ac: 1 }), false)
  t.match(compile('{ /a/- }').match({ a: 1, b: 1 }), false)

  t.match(compile('{ /a/? }').match({}), true)
  t.match(compile('{ /a/? }').match({ b: 1 }), true)
  t.match(compile('{ /a/? }').match({ a: 'x' }), true)
  t.match(compile('{ /a/? }').match({ a: 1 }), true)
  t.match(compile('{ /a/? }').match({ ab: 1, ac: 1 }), false)
  t.match(compile('{ /a/? }').match({ a: 1, b: 1 }), true)

  t.match(compile('{ /a/* }').match({}), true)
  t.match(compile('{ /a/* }').match({ b: 1 }), true)
  t.match(compile('{ /a/* }').match({ a: 'x' }), true)
  t.match(compile('{ /a/* }').match({ a: 1 }), true)
  t.match(compile('{ /a/* }').match({ ab: 1, ac: 1 }), true)
  t.match(compile('{ /a/* }').match({ a: 1, b: 1 }), true)

  t.match(compile('{ /a/+ }').match({}), false)
  t.match(compile('{ /a/+ }').match({ b: 1 }), false)
  t.match(compile('{ /a/+ }').match({ a: 'x' }), true)
  t.match(compile('{ /a/+ }').match({ a: 1 }), true)
  t.match(compile('{ /a/+ }').match({ ab: 1, ac: 1 }), true)
  t.match(compile('{ /a/+ }').match({ a: 1, b: 1 }), true)

  t.match(compile('{ /a/-: number }').match({}), true)
  t.match(compile('{ /a/-: number }').match({ b: 1 }), true)
  t.match(compile('{ /a/-: number }').match({ a: 'x' }), false)
  t.match(compile('{ /a/-: number }').match({ a: 1 }), false)
  t.match(compile('{ /a/-: number }').match({ ab: 1, ac: 1 }), false)
  t.match(compile('{ /a/-: number }').match({ a: 1, b: 1 }), false)

  t.match(compile('{ /a/?: number }').match({}), true)
  t.match(compile('{ /a/?: number }').match({ b: 1 }), true)
  t.match(compile('{ /a/?: number }').match({ a: 'x' }), false)
  t.match(compile('{ /a/?: number }').match({ a: 1 }), true)
  t.match(compile('{ /a/?: number }').match({ ab: 1, ac: 1 }), false)
  t.match(compile('{ /a/?: number }').match({ a: 1, b: 1 }), true)
  t.match(compile('{ /a/?: number }').match({ ab: 1, ac: 'x' }), false)

  t.match(compile('{ /a/*: number }').match({}), true)
  t.match(compile('{ /a/*: number }').match({ b: 1 }), true)
  t.match(compile('{ /a/*: number }').match({ a: 'x' }), false)
  t.match(compile('{ /a/*: number }').match({ a: 1 }), true)
  t.match(compile('{ /a/*: number }').match({ ab: 1, ac: 1 }), true)
  t.match(compile('{ /a/*: number }').match({ a: 1, b: 1 }), true)
  t.match(compile('{ /a/*: number }').match({ ab: 1, ac: 'x' }), false)

  t.match(compile('{ /a/+: number }').match({}), false)
  t.match(compile('{ /a/+: number }').match({ b: 1 }), false)
  t.match(compile('{ /a/+: number }').match({ a: 'x' }), false)
  t.match(compile('{ /a/+: number }').match({ a: 1 }), true)
  t.match(compile('{ /a/+: number }').match({ ab: 1, ac: 1 }), true)
  t.match(compile('{ /a/+: number }').match({ a: 1, b: 1 }), true)
  t.match(compile('{ /a/+: number }').match({ ab: 1, ac: 'x' }), false)

  t.done()
})

test('numeric cardinality', t => {
  t.match(compile('{ /a/{0}: number }').match({}), true)
  t.match(compile('{ /a/{0}: number }').match({ b: 1 }), true)
  t.match(compile('{ /a/{0}: number }').match({ a: 'x' }), false)
  t.match(compile('{ /a/{0}: number }').match({ a: 1 }), false)
  t.match(compile('{ /a/{0}: number }').match({ ab: 1, ac: 1 }), false)
  t.match(compile('{ /a/{0}: number }').match({ a: 1, b: 1 }), false)

  t.match(compile('{ /a/{1}: number }').match({}), false)
  t.match(compile('{ /a/{1}: number }').match({ b: 1 }), false)
  t.match(compile('{ /a/{1}: number }').match({ a: 'x' }), false)
  t.match(compile('{ /a/{1}: number }').match({ a: 1 }), true)
  t.match(compile('{ /a/{1}: number }').match({ ab: 1, ac: 1 }), false)
  t.match(compile('{ /a/{1}: number }').match({ a: 1, b: 1 }), true)

  t.match(compile('{ /a/{1,}: number }').match({}), false)
  t.match(compile('{ /a/{1,}: number }').match({ b: 1 }), false)
  t.match(compile('{ /a/{1,}: number }').match({ a: 'x' }), false)
  t.match(compile('{ /a/{1,}: number }').match({ a: 1 }), true)
  t.match(compile('{ /a/{1,}: number }').match({ ab: 1, ac: 1 }), true)
  t.match(compile('{ /a/{1,}: number }').match({ ab: 1, ac: 1, ad: 1 }), true)
  t.match(compile('{ /a/{1,}: number }').match({ a: 1, b: 1 }), true)
  t.match(compile('{ /a/{1,}: number }').match({ ab: 1, ac: 'x' }), false)

  t.match(compile('{ /a/{1,2}: number }').match({}), false)
  t.match(compile('{ /a/{1,2}: number }').match({ b: 1 }), false)
  t.match(compile('{ /a/{1,2}: number }').match({ a: 'x' }), false)
  t.match(compile('{ /a/{1,2}: number }').match({ a: 1 }), true)
  t.match(compile('{ /a/{1,2}: number }').match({ ab: 1, ac: 1 }), true)
  t.match(compile('{ /a/{1,2}: number }').match({ ab: 1, ac: 1, ad: 1 }), false)
  t.match(compile('{ /a/{1,2}: number }').match({ a: 1, b: 1 }), true)
  t.match(compile('{ /a/{1,2}: number }').match({ ab: 1, ac: 'x' }), false)

  t.done()
})
