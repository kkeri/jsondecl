'use strict'

const test = require('tap').test
const _compile = require('../lib/index').compile
const model = require('../lib/model')

function compile(str) {
  return _compile(str, {
    filename: __filename,
    error: (str) => console.log(str)
  })
}

test('simple value', t => {
  t.match(compile('1').test(1), true)
  t.match(compile('1').test(2), false)
  t.match(compile('"abc"').test("abc"), true)
  t.match(compile('"abc"').test("d"), false)
  t.match(compile('null').test(null), true)
  t.match(compile('true').test(true), true)
  t.match(compile('false').test(false), true)
  t.done()
})

test('or', t => {
  t.match(compile('1|2|3').test(1), true)
  t.match(compile('1|2|3').test(2), true)
  t.match(compile('1|2|3').test(3), true)
  t.match(compile('1|2|3').test(4), false)
  t.done()
})

test('and', t => {
  t.match(compile('1&2').test(1), false)
  t.match(compile('1&2').test(2), false)
  t.match(compile('1&2').test(3), false)
  t.match(compile('2&2').test(2), true)
  t.done()
})

test('not', t => {
  t.match(compile('!1').test(1), false)
  t.match(compile('!1').test(2), true)
  t.done()
})
