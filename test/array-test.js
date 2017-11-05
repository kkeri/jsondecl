'use strict'

const test = require('tap').test
const _compile = require('../lib/index').compile
const model = require('../lib/model')

function compile(str) {
  return _compile(str, {
    filename: __filename
  })
}

test('array', t => {
  t.match(compile('[]').test(0), false)
  t.match(compile('[]').test({}), false)
  t.match(compile('[]').test(/a/), false)
  t.match(compile('[]').test([]), true)
  t.match(compile('[]').test([1]), true)
  t.match(compile('[]').test([1, 'a', null]), true)

  t.match(compile('[1]').test([1]), true)
  t.match(compile('[1]').test([1, 2]), true)
  t.match(compile('[1]').test([2]), false)
  t.match(compile('[string]').test([1]), false)
  t.match(compile('[string]').test(['a']), true)
  t.match(compile('[string]').test(['a', 1]), true)
  
  t.match(compile('[number?]').test([]), true)
  t.match(compile('[number?]').test([1]), true)
  t.match(compile('[number?]').test([1, 2]), true)
  t.match(compile('[number?]').test(['a']), true)
  t.match(compile('[number?]').test([1, 'a']), true)

  t.match(compile('[number*]').test([]), true)
  t.match(compile('[number*]').test([1]), true)
  t.match(compile('[number*]').test([1, 2]), true)
  t.match(compile('[number*]').test(['a']), true)
  t.match(compile('[number*]').test([1, 'a']), true)

  t.match(compile('[number+]').test([]), false)
  t.match(compile('[number+]').test([1]), true)
  t.match(compile('[number+]').test([1, 2]), true)
  t.match(compile('[number+]').test(['a']), false)
  t.match(compile('[number+]').test([1, 'a']), true)

  t.match(compile('[number{0}]').test([]), true)
  t.match(compile('[number{0}]').test([1]), true)
  t.match(compile('[number{0}]').test([1, 2]), true)
  t.match(compile('[number{0}]').test(['a']), true)
  t.match(compile('[number{0}]').test([1, 'a']), true)

  t.match(compile('[number{2}]').test([]), false)
  t.match(compile('[number{2}]').test([1]), false)
  t.match(compile('[number{2}]').test([1, 2]), true)
  t.match(compile('[number{2}]').test(['a']), false )
  t.match(compile('[number{2}]').test([1, 'a']), false)

  t.match(compile('[number, string]').test([1]), false)
  t.match(compile('[number, string]').test(['a']), false)
  t.match(compile('[number, string]').test([1, 2, 'a']), false)
  t.match(compile('[number, string]').test([1, 'a']), true)
  t.match(compile('[number, string]').test([1, 'a', 'b']), true)

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

test('array repetition', t => {
  t.match(compile('[]?').test([]), true)
  t.match(compile('[]*').test([]), true)
  t.match(compile('[]+').test([]), true)
  t.match(compile('[]{0,2}').test([]), true)

  t.match(compile('[]?').test([1]), true)
  t.match(compile('[]*').test([1]), true)
  t.match(compile('[]+').test([1]), true)
  t.match(compile('[]{0,2}').test([1]), true)

  t.match(compile('[number]?').test([]), true)
  t.match(compile('[number]?').test([1]), true)
  t.match(compile('[number]?').test([1, 2]), true)

  t.match(compile('[number]*').test([]), true)
  t.match(compile('[number]*').test([1]), true)
  t.match(compile('[number]*').test([1, 2]), true)

  t.match(compile('[number]+').test([]), false)
  t.match(compile('[number]+').test([1]), true)
  t.match(compile('[number]+').test([1, 2]), true)

  t.match(compile('[number]{0,2}').test([]), true)
  t.match(compile('[number]{0,2}').test([1]), true)
  t.match(compile('[number]{0,2}').test([1, 2]), true)
  t.match(compile('[number]{0,2}').test([1, 2, 3]), true)

  t.match(compile('[number, string]*').test([]), true)
  t.match(compile('[number, string]*').test([1]), true)
  t.match(compile('[number, string]*').test([1, 'a']), true)
  t.match(compile('[number, string]*').test([1, 'a', 2]), true)
  t.match(compile('[number, string]*').test([1, 'a', 2, 'b']), true)
  t.match(compile('[number, string]*').test([1, 2]), true)

  t.match(compile('[number, string]{2}').test([1, 'a']), false)
  t.match(compile('[number, string]{2}').test([1, 'a', 2]), false)
  t.match(compile('[number, string]{2}').test([1, 'a', 2, 'b']), true)
  t.match(compile('[number, string]{2}').test([1, 'a', 2, 'b', 3]), true)
  
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

test('array combinations', t => {
  t.match(compile('[number] | [string]').test([1]), true)
  t.match(compile('[number] | [string]').test(['a']), true)
  t.match(compile('[number, number] | [number, string]').test([1, 1]), true)
  t.match(compile('[number, number] | [number, string]').test([1, 'a']), true)
  
  t.match(compile('[number, any] & [any, string]').test([1, 'a']), true)
  
  t.done()
})
