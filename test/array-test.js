'use strict'

const test = require('tap').test
const jsondl = require('../lib/index')

function compile (str) {
  const messages = []
  return jsondl.compile(str, { messages })
}

test('array', t => {
  t.match(compile('[]').match(0), false)
  t.match(compile('[]').match({}), false)
  t.match(compile('[]').match(/a/), false)
  t.match(compile('[]').match([]), true)
  t.match(compile('[]').match([1]), true)
  t.match(compile('[]').match([1, 'a', null]), true)

  t.match(compile('[1]').match([1]), true)
  t.match(compile('[1]').match([1, 2]), true)
  t.match(compile('[1]').match([2]), false)
  t.match(compile('[string]').match([1]), false)
  t.match(compile('[string]').match(['a']), true)
  t.match(compile('[string]').match(['a', 1]), true)

  t.match(compile('[number?]').match([]), true)
  t.match(compile('[number?]').match([1]), true)
  t.match(compile('[number?]').match([1, 2]), true)
  t.match(compile('[number?]').match(['a']), true)
  t.match(compile('[number?]').match([1, 'a']), true)

  t.match(compile('[number*]').match([]), true)
  t.match(compile('[number*]').match([1]), true)
  t.match(compile('[number*]').match([1, 2]), true)
  t.match(compile('[number*]').match(['a']), true)
  t.match(compile('[number*]').match([1, 'a']), true)

  t.match(compile('[number+]').match([]), false)
  t.match(compile('[number+]').match([1]), true)
  t.match(compile('[number+]').match([1, 2]), true)
  t.match(compile('[number+]').match(['a']), false)
  t.match(compile('[number+]').match([1, 'a']), true)

  t.match(compile('[number{0}]').match([]), true)
  t.match(compile('[number{0}]').match([1]), true)
  t.match(compile('[number{0}]').match([1, 2]), true)
  t.match(compile('[number{0}]').match(['a']), true)
  t.match(compile('[number{0}]').match([1, 'a']), true)

  t.match(compile('[number{2}]').match([]), false)
  t.match(compile('[number{2}]').match([1]), false)
  t.match(compile('[number{2}]').match([1, 2]), true)
  t.match(compile('[number{2}]').match(['a']), false)
  t.match(compile('[number{2}]').match([1, 'a']), false)

  t.match(compile('[number, string]').match([1]), false)
  t.match(compile('[number, string]').match(['a']), false)
  t.match(compile('[number, string]').match([1, 2, 'a']), false)
  t.match(compile('[number, string]').match([1, 'a']), true)
  t.match(compile('[number, string]').match([1, 'a', 'b']), true)

  t.done()
})

test('array repetition', t => {
  t.match(compile('[]?').match([]), true)
  t.match(compile('[]*').match([]), true)
  t.match(compile('[]+').match([]), true)
  t.match(compile('[]{0,2}').match([]), true)

  t.match(compile('[]?').match([1]), true)
  t.match(compile('[]*').match([1]), true)
  t.match(compile('[]+').match([1]), true)
  t.match(compile('[]{0,2}').match([1]), true)

  t.match(compile('[number]?').match([]), true)
  t.match(compile('[number]?').match([1]), true)
  t.match(compile('[number]?').match([1, 2]), true)

  t.match(compile('[number]*').match([]), true)
  t.match(compile('[number]*').match([1]), true)
  t.match(compile('[number]*').match([1, 2]), true)

  t.match(compile('[number]+').match([]), false)
  t.match(compile('[number]+').match([1]), true)
  t.match(compile('[number]+').match([1, 2]), true)

  t.match(compile('[number]{0,2}').match([]), true)
  t.match(compile('[number]{0,2}').match([1]), true)
  t.match(compile('[number]{0,2}').match([1, 2]), true)
  t.match(compile('[number]{0,2}').match([1, 2, 3]), true)

  t.match(compile('[number, string]*').match([]), true)
  t.match(compile('[number, string]*').match([1]), true)
  t.match(compile('[number, string]*').match([1, 'a']), true)
  t.match(compile('[number, string]*').match([1, 'a', 2]), true)
  t.match(compile('[number, string]*').match([1, 'a', 2, 'b']), true)
  t.match(compile('[number, string]*').match([1, 2]), true)

  t.match(compile('[number, string]{2}').match([1, 'a']), false)
  t.match(compile('[number, string]{2}').match([1, 'a', 2]), false)
  t.match(compile('[number, string]{2}').match([1, 'a', 2, 'b']), true)
  t.match(compile('[number, string]{2}').match([1, 'a', 2, 'b', 3]), true)

  t.done()
})

test('array combinations', t => {
  t.match(compile('[number] | [string]').match([1]), true)
  t.match(compile('[number] | [string]').match(['a']), true)
  t.match(compile('[number, number] | [number, string]').match([1, 1]), true)
  t.match(compile('[number, number] | [number, string]').match([1, 'a']), true)

  t.match(compile('[number, any] & [any, string]').match([1, 'a']), true)

  t.done()
})
