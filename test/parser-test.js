'use strict'

const test = require('tap').test
const _parse = require('../lib/parser').parse

function parse (str) {
  return _parse(str, {
    error: (str) => console.error('\n', str)
  })
}

test('empty', t => {
  t.notEqual(parse(''), null)
  t.notEqual(parse('\r'), null)
  t.done()
})

test('comment', t => {
  t.notEqual(parse('// comment'), null)
  t.notEqual(parse('// comment\r'), null)
  t.notEqual(parse('// comment\r//comment'), null)
  t.notEqual(parse('/**/'), null)
  t.notEqual(parse('/* */'), null)
  t.notEqual(parse('/* *//* */'), null)
  t.notEqual(parse('/*\r\n\t*///'), null)
  t.notEqual(parse('//\rexport//\rconst//\ra//\r=//\r1//\r'), null)
  t.notEqual(parse('//export//\rconst//\ra//\r=//\r1//\r'), null)
  t.equal(parse('//\rexport//const//\ra//\r=//\r1//\r'), null)
  t.equal(parse('//\rexport//\rconst//a//\r=//\r1//\r'), null)
  t.equal(parse('//\rexport//\rconst//\ra//=//\r1//\r'), null)
  t.equal(parse('//\rexport//\rconst//\ra//\r=//1//\r'), null)
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

test('logical', t => {
  t.notEqual(parse('!a'), null)
  t.notEqual(parse('a|b'), null)
  t.notEqual(parse('a&b'), null)
  t.notEqual(parse('a&b|c'), null)
  t.done()
})

test('parentheses', t => {
  t.notEqual(parse('(a)'), null)
  t.notEqual(parse('(a|b)'), null)
  t.notEqual(parse('!(a|b)'), null)
  t.notEqual(parse('a&(b|c)'), null)
  t.done()
})

test('invalid regex', t => {
  t.equal(parse('/a/3'), null)
  t.equal(parse('/\\/g'), null)
  t.done()
})

test('valid regex', t => {
  //t.notEqual(parse('//'), null)
  t.notEqual(parse('/a/'), null)
  t.notEqual(parse('/ abc/'), null)
  t.notEqual(parse('/a/g'), null)
  t.notEqual(parse('/\\//g'), null)
  t.notEqual(parse('/\t/g'), null)
  t.notEqual(parse('/\\r\\n/g'), null)
  t.notEqual(parse('/a/ghj'), null)
  t.done()
})

test('invalid grouping', t => {
  t.equal(parse('()'), null)
  t.done()
})
test('valid grouping', t => {
  t.notEqual(parse('(1)'), null)
  t.notEqual(parse('(a)'), null)
  t.notEqual(parse('(a())'), null)
  t.notEqual(parse('(a.b())'), null)
  t.notEqual(parse('a | (b & c)'), null)
  t.notEqual(parse('1 | (2 | "a" & a.b)'), null)
  t.done()
})

test('invalid import', t => {
  t.equal(parse('import'), null)
  t.equal(parse('import a'), null)
  t.equal(parse('import from'), null)
  t.equal(parse('import {} from'), null)
  t.equal(parse('import {a as } from "a"'), null)
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
  t.notEqual(parse('import { } from "b"; 0'), null)
  t.notEqual(parse('import { a } from "b"; 0'), null)
  t.notEqual(parse('import { a, b } from "a/b"; 0'), null)
  t.notEqual(parse('import { a as x } from "a"'), null)
  t.notEqual(parse('import { a as x, b, c as z } from "a"'), null)
  t.notEqual(parse('import { a as x, } from "a"'), null)
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

test('missing terminator', t => {
  t.equal(parse('import {} from "a" 1'), null)
  t.equal(parse('import {} from "a" const b = 0'), null)
  t.equal(parse('import {} from "a" const b = 0 c'), null)
  t.equal(parse('const a = 0 const b = 0'), null)
  t.done()
})

test('invalid terminator', t => {
  t.equal(parse(';'), null)
  t.equal(parse('const a = 1;;'), null)
  t.done()
})

test('valid terminator', t => {
  t.equal(parse(';'), null)
  t.equal(parse('const a = 1;;'), null)

  t.notEqual(parse('import {} from "a"; 1'), null)
  t.notEqual(parse('import {} from "a"; const b = 0'), null)
  t.notEqual(parse('import {} from "a"; const b = 0; c'), null)
  t.notEqual(parse('const a = 0; const b = 0'), null)

  t.notEqual(parse('import {} from "a"; 1;'), null)
  t.notEqual(parse('import {} from "a"; const b = 0;'), null)
  t.notEqual(parse('import {} from "a"; const b = 0; c;'), null)
  t.notEqual(parse('const a = 0; const b = 0;'), null)

  t.notEqual(parse('import {} from "a"\n 1\n'), null)
  t.notEqual(parse('import {} from "a"\n const b = 0\n'), null)
  t.notEqual(parse('import {} from "a"\n const b = 0\n c\n'), null)
  t.notEqual(parse('const a = 0\n const b = 0\n'), null)

  t.done()
})

test('invalid object', t => {
  t.equal(parse('{'), null)
  t.equal(parse('{ "a" }'), null)
  t.equal(parse('{ "a" : }'), null)
  t.equal(parse('{ "a": "b", }'), null)
  t.done()
})

test('valid object', t => {
  t.notEqual(parse('{}'), null)
  t.notEqual(parse('{ "a": "b" }'), null)
  t.notEqual(parse('{ a: b }'), null)
  t.notEqual(parse('{ a: b, c: d }'), null)
  t.notEqual(parse('{ a | b : c & d }'), null)
  t.done()
})

test('invalid cardinality', t => {
  t.equal(parse('{ "a"%: "b" }'), null)
  t.equal(parse('{ "a"{}: "b" }'), null)
  t.equal(parse('{ "a"{"a"}: "b" }'), null)
  t.equal(parse('{ "a"{x}: "b" }'), null)
  t.equal(parse('{ "a"{1-3}: "b" }'), null)
  t.done()
})

test('valid cardinality', t => {
  t.notEqual(parse('{ "a"*: "b" }'), null)
  t.notEqual(parse('{ "a"?: "b" }'), null)
  t.notEqual(parse('{ "a"+: "b" }'), null)
  t.notEqual(parse('{ "a"-: "b" }'), null)
  t.notEqual(parse('{ "a"- }'), null)
  t.notEqual(parse('{ "a"-, b- }'), null)
  t.notEqual(parse('{ "a"{1}: "b" }'), null)
  t.notEqual(parse('{ "a"{33}: "b" }'), null)
  t.notEqual(parse('{ "a"{1..3}: "b" }'), null)
  t.done()
})

test('valid function call', t => {
  t.notEqual(parse('a()'), null)
  t.notEqual(parse('a(1)'), null)
  t.notEqual(parse('a(b)'), null)
  t.notEqual(parse('a("b")'), null)
  t.notEqual(parse('a({})'), null)
  t.notEqual(parse('a(1,b,{})'), null)
  t.done()
})

test('invalid let...in', t => {
  t.equal(parse('let in a'), null)
  t.equal(parse('let 1 in a'), null)
  t.equal(parse('let a = 1'), null)
  t.equal(parse('let a = 1 in'), null)
  t.done()
})

test('valid let...in', t => {
  t.notEqual(parse('let a = 1 in a'), null)
  t.notEqual(parse('let a = 1, b = 2 in a'), null)
  t.notEqual(parse('let a = 1, b = 2 in let c = 3 in a'), null)
  t.done()
})


