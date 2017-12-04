'use strict'

const test = require('tap').test
const _compile = require('../lib/index').compile
const model = require('../lib/model')
const RuntimeError = require('../lib/diag').RuntimeError

function compile (str) {
  const messages = []
  return _compile(str, {
    filename: __filename,
    messages
  })
}

test('closed object', t => {
  t.match(compile('closed({ /a/* })').test({}), true)
  t.match(compile('closed({ /a/* })').test({ b: 1 }), false)
  t.match(compile('closed({ /a/* })').test({ a: 'x' }), true)
  t.match(compile('closed({ /a/* })').test({ a: 1 }), true)
  t.match(compile('closed({ /a/* })').test({ ab: 1, ac: 1 }), true)
  t.match(compile('closed({ /a/* })').test({ a: 1, b: 1 }), false)

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

test('closed array', t => {
  t.match(compile('closed([])').test([]), true)
  t.match(compile('closed([])').test([1]), false)

  t.match(compile('closed([number])').test([1]), true)
  t.match(compile('closed([number])').test([1, 2]), false)
  t.match(compile('closed([number, string])').test([1, 2]), false)
  t.match(compile('closed([number, string])').test([1, 'a']), true)
  t.match(compile('closed([number, string])').test([1, 'a', 'b']), false)

  t.match(compile('closed([number] | [string])').test([1]), true)
  t.match(compile('closed([number] | [string])').test(['a']), true)
  t.match(compile('closed([number] | [string])').test([1, 1]), false)
  t.match(compile('closed([number] | [string])').test(['a', 1]), false)

  t.match(compile('closed([string] | [string, number])').test(['a', 1]), true)
  t.match(compile('closed([string, number] | [string])').test(['a', 1]), true)
  t.match(compile('closed([string] & [string, number])').test(['a', 1]), true)
  t.match(compile('closed([string, number] & [string])').test(['a', 1]), true)

  t.match(compile('closed([string] | [string, number])').test(['a', 1, 2]), false)
  t.match(compile('closed([string, number] | [string])').test(['a', 1, 2]), false)
  t.match(compile('closed([string] & [string, number])').test(['a', 1, 2]), false)
  t.match(compile('closed([string, number] & [string])').test(['a', 1, 2]), false)

  t.match(compile('closed([number, any] & [any, string])').test([1, 'a']), true)
  t.match(compile('closed([number, any] & [any, string])').test([1, 'a', 2]), false)

  t.match(compile('closed([[number]])').test([[1]]), true)
  t.match(compile('closed([[number]])').test([[1, 2]]), true)
  t.match(compile('closed([[number]])').test([[1], 2]), false)

  t.match(compile('closed(closed([number, string]))').test([1, 'a']), true)
  t.match(compile('closed(closed([number, string]))').test([1, 'a', 'b']), false)

  t.done()
})

test('closed array repetitions', t => {
  t.match(compile('closed([number]?)').test([1, 2]), false)
  t.match(compile('closed([number]{0,2})').test([1, 2, 3]), false)

  t.match(compile('closed([number, string]*)').test([]), true)
  t.match(compile('closed([number, string]*)').test([1]), false)
  t.match(compile('closed([number, string]*)').test([1, 'a']), true)
  t.match(compile('closed([number, string]*)').test([1, 'a', 2]), false)
  t.match(compile('closed([number, string]*)').test([1, 'a', 2, 'b']), true)
  t.match(compile('closed([number, string]*)').test([1, 2]), false)

  t.match(compile('closed([number, string]{2})').test([1, 'a']), false)
  t.match(compile('closed([number, string]{2})').test([1, 'a', 2]), false)
  t.match(compile('closed([number, string]{2})').test([1, 'a', 2, 'b']), true)
  t.match(compile('closed([number, string]{2})').test([1, 'a', 2, 'b', 3]), false)

  t.done()
})

test('closed combinations', t => {
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
