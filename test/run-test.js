'use strict'

const test = require('tap').test
const _compile = require('../lib/index').compile
const model = require('../lib/model')

function compile (str) {
  return _compile(str, {
    filename: __filename
  })
}

test('simple value', t => {
  t.match(compile('1').match(1), true)
  t.match(compile('1').match(2), false)
  t.match(compile('"abc"').match('abc'), true)
  t.match(compile('"abc"').match('d'), false)
  t.match(compile('null').match(null), true)
  t.match(compile('true').match(true), true)
  t.match(compile('false').match(false), true)
  t.done()
})

test('regex', t => {
  t.match(compile('/a/').match('a'), true)
  t.match(compile('/a/').match('b'), false)
  t.match(compile('/ abc/').match('1 abc2'), true)
  t.match(compile('/ abc/').match('1 abd2'), false)
  t.match(compile('/ab/i').match('abc'), true)
  t.match(compile('/ab/i').match('ABC'), true)
  t.match(compile('/\\//i').match('/'), true)
  t.match(compile('/\t/').match('\t'), true)
  t.match(compile('/\\t/').match('\t'), true)
  t.done()
})

test('built-in pattern', t => {
  t.match(compile('any').match(null), true)
  t.match(compile('any').match(true), true)
  t.match(compile('any').match(false), true)
  t.match(compile('any').match(1), true)
  t.match(compile('any').match('a'), true)
  t.match(compile('any').match({}), true)
  t.match(compile('any').match([]), true)
  t.match(compile('any').match(/a/), true)
  t.match(compile('string').match(1), false)
  t.done()
})

test('built-in numeric pattern', t => {
  t.match(compile('numeric').match(1), true)
  t.match(compile('numeric').match(NaN), true)
  t.match(compile('numeric').match(Number.POSITIVE_INFINITY), true)
  t.match(compile('numeric').match(Number.NEGATIVE_INFINITY), true)
  t.match(compile('number').match(1), true)
  t.match(compile('number').match(NaN), false)
  t.match(compile('number').match(Number.POSITIVE_INFINITY), false)
  t.match(compile('number').match(Number.NEGATIVE_INFINITY), false)
  t.match(compile('finite').match(1), true)
  t.match(compile('finite').match(NaN), false)
  t.match(compile('finite').match(Number.POSITIVE_INFINITY), false)
  t.match(compile('finite').match(Number.NEGATIVE_INFINITY), false)
  t.match(compile('integer').match(1), true)
  t.match(compile('integer').match(1.0000001), false)
  t.match(compile('integer').match(NaN), false)
  t.match(compile('integer').match(Number.POSITIVE_INFINITY), false)
  t.match(compile('integer').match(Number.NEGATIVE_INFINITY), false)
  t.done()
})

test('built-in function', t => {
  t.match(compile('lt(1)').match(0), true)
  t.match(compile('lt(1)').match(1), false)
  t.match(compile('le(1)').match(1), true)
  t.match(compile('le(1)').match(2), false)
  t.match(compile('gt(1)').match(2), true)
  t.match(compile('gt(1)').match(1), false)
  t.match(compile('ge(1)').match(1), true)
  t.match(compile('ge(1)').match(0), false)
  t.done()
})

test('or', t => {
  t.match(compile('1|2|3').match(1), true)
  t.match(compile('1|2|3').match(2), true)
  t.match(compile('1|2|3').match(3), true)
  t.match(compile('1|2|3').match(4), false)
  t.match(compile('number|string').match(1), true)
  t.match(compile('number|string').match('a'), true)
  t.match(compile('number|string').match(null), false)
  t.match(compile('/a/|/b/').match('a'), true)
  t.match(compile('/a/|/b/').match('b'), true)
  t.match(compile('/a/|/b/').match('c'), false)
  t.done()
})

test('and', t => {
  t.match(compile('1&2').match(1), false)
  t.match(compile('1&2').match(2), false)
  t.match(compile('1&2').match(3), false)
  t.match(compile('2&2').match(2), true)
  t.match(compile('gt(1) & lt(3)').match(1), false)
  t.match(compile('gt(1) & lt(3)').match(2), true)
  t.match(compile('gt(1) & lt(3)').match(3), false)
  t.match(compile('/a/&/b/').match('abc'), true)
  t.match(compile('/a/&/b/').match('ca'), false)
  t.match(compile('/a/&/b/').match('cb'), false)
  t.done()
})

test('not', t => {
  t.match(compile('!1').match(1), false)
  t.match(compile('!1').match(2), true)
  t.match(compile('!!1').match(1), true)
  t.match(compile('!!!1').match(1), false)
  t.done()
})

test('override builtins', t => {
  t.match(compile('const any = 1; any').match(0), false)
  t.match(compile('const any = 1; any').match(1), true)
  t.match(compile('const unique = 1; unique').match(0), false)
  t.match(compile('const unique = 1; unique').match(1), true)
  t.done()
})

test('grouping', t => {
  t.match(compile('(1)').match(1), true)
  t.match(compile('!(1|2)').match(1), false)
  t.match(compile('!(1|2)').match(2), false)
  t.match(compile('!(1|2)').match(3), true)
  t.match(compile('/a/ & (/b/ | /c/)').match('a'), false)
  t.match(compile('/a/ & (/b/ | /c/)').match('b'), false)
  t.match(compile('/a/ & (/b/ | /c/)').match('c'), false)
  t.match(compile('/a/ & (/b/ | /c/)').match('ab'), true)
  t.match(compile('/a/ & (/b/ | /c/)').match('ac'), true)
  t.match(compile('/a/ & (/b/ | /c/)').match('bc'), false)
  t.done()
})

test('let...in', t => {
  t.match(compile('let a = 1 in a').match(0), false)
  t.match(compile('let a = 1 in a').match(1), true)
  t.match(compile('let a = 1 in 2').match(2), true)
  t.match(compile('const x = 1; let a = x in a').match(0), false)
  t.match(compile('const x = 1; let a = x in a').match(1), true)
  t.match(compile('const a = 1; let b = a in let c = b in c').match(0), false)
  t.match(compile('const a = 1; let b = a in let c = b in c').match(1), true)
  t.match(compile('export default let b = a in let c = b in c; const a = 1').match(1), true)
  t.match(compile('let b = 1, c = b in c').match(1), true)
  t.match(compile('let c = b, b = 1 in c').match(1), true)

  t.done()
})
