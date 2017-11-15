'use strict'

const test = require('tap').test
const util = require('../lib/util')

test('empty', t => {
  t.match(util.arrayToJsonPath([]), '$')
  t.done()
})

test('array index', t => {
  t.match(util.arrayToJsonPath([1]), '$[1]')
  t.done()
})

test('id property', t => {
  t.match(util.arrayToJsonPath(['abc']), '$.abc')
  t.done()
})

test('non-id property', t => {
  t.match(util.arrayToJsonPath(['%']), '$["%"]')
  t.done()
})

test('misc', t => {
  t.match(util.arrayToJsonPath([1, 'a', '%']), '$[1].a["%"]')
  t.done()
})
