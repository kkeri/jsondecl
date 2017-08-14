'use strict'

const test = require('tap').test
const parse = require('../lib/parser').parse

test('invalid trivial', t => {
  t.equal(parse(''), null)
  t.equal(parse('+'), null)
  t.done()
})

test('invalid export', t => {
  t.equal(parse('export'), null)
  t.equal(parse('export a'), null)
  t.equal(parse('export default'), null)
  t.done()
})

test('invalid const', t => {
  t.equal(parse('const'), null)
  t.equal(parse('const a'), null)
  t.equal(parse('const a ='), null)
  t.equal(parse('export const'), null)
  t.equal(parse('export const a'), null)
  t.equal(parse('export const a ='), null)
  t.done()
})
