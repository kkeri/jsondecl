'use strict'

const test = require('tap').test
const parse = require('../lib/parser').parse

test('invalid default', t => {
  t.equal(parse(''), null)
  t.equal(parse('\r'), null)
  t.done()
})

test('invalid number', t => {
  t.equal(parse('-'), null)
  t.equal(parse('+'), null)
  t.equal(parse('+1'), null)
  t.equal(parse('00'), null)
  t.equal(parse('1.'), null)
  t.equal(parse('.1'), null)
  t.equal(parse('1..1'), null)
  t.done()
})

test('invalid string', t => {
  t.equal(parse('\'\''), null)
  t.equal(parse('"""'), null)
  t.equal(parse('"\r"'), null)
  t.equal(parse('"\\e"'), null)
  t.equal(parse('"\\ua"'), null)
  t.equal(parse('"\\u012"'), null)
  t.done()
})

test('invalid import', t => {
  t.equal(parse('import'), null)
  t.equal(parse('import a'), null)
  t.equal(parse('import from'), null)
  t.equal(parse('import {} from'), null)
  t.equal(parse('import {} from ""'), null)
  t.equal(parse('import {} from "a"'), null)
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

test('valid number', t => {
  t.notEqual(parse('0'), null)
  t.notEqual(parse('1'), null)
  t.notEqual(parse('-1'), null)
  t.notEqual(parse('23456789'), null)
  t.notEqual(parse('0.0'), null)
  t.notEqual(parse('0.12345'), null)
  t.notEqual(parse('0e1'), null)
  t.notEqual(parse('0e+1'), null)
  t.notEqual(parse('0.1e-1'), null)
  t.notEqual(parse('10E1'), null)
  t.notEqual(parse('1E+1'), null)
  t.notEqual(parse('1.2E-1'), null)
  t.done()
})

test('valid string', t => {
  t.notEqual(parse('""'), null)
  t.notEqual(parse('" "'), null)
  t.notEqual(parse('"abc"'), null)
  t.notEqual(parse('"\\r"'), null)
  t.notEqual(parse('"\\r\\n"'), null)
  t.notEqual(parse('"asd\\rfgh\\njkl"'), null)
  t.notEqual(parse('"\\u01ab"'), null)
  t.notEqual(parse('"\\u01ab...."'), null)
  t.done()
})

test('valid id', t => {
  t.notEqual(parse('_'), null)
  t.notEqual(parse('a'), null)
  t.notEqual(parse('b123'), null)
  t.notEqual(parse('_b'), null)
  t.notEqual(parse('__1_2_'), null)
  t.done()
})

test('valid import', t => {
  t.notEqual(parse('import { } from "b" 0'), null)
  t.notEqual(parse('import { a } from "b" 0'), null)
  t.notEqual(parse('import { a, b } from "a-b" 0'), null)
  t.done()
})

test('invalid const', t => {
  t.equal(parse('const'), null)
  t.equal(parse('const 0'), null)
  t.equal(parse('const = 0'), null)
  t.done()
})

test('valid const', t => {
  t.notEqual(parse('const a = 0'), null)
  t.notEqual(parse('const b = "a"'), null)
  t.done()
})


