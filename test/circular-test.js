'use strict'

const test = require('tap').test
const _compile = require('../lib/index').compile
const model = require('../lib/model')
const FatalError = require('../lib/util').FatalError

function compile(str) {
  return _compile(str, {
    filename: __filename
  })
}

test('on-demand', t => {
  t.match(compile('const a = b; const b = a; 1').test(1), true)
  t.done()
})

test('single global', t => {
  let errors = []
  function diag (desc) { errors.push(desc.message) }
  t.throws(() => compile('const a = a; a').test(1, { diag }))
  t.match(errors.length, 1)
  t.ok(/'a'/.test(errors[0]))
  t.done()
})

test('two globals', t => {
  let errors = []
  function diag (desc) { errors.push(desc.message) }
  t.throws(() => compile('const a = b; const b = a; a').test(1, { diag }))
  t.match(errors.length, 2)
  t.ok(/'b'/.test(errors[0]))
  t.ok(/'a'/.test(errors[1]))
  t.done()
})

test('single local', t => {
  let errors = []
  function diag (desc) { errors.push(desc.message) }
  t.throws(() => compile('let a = a in a').test(1, { diag }))
  t.match(errors.length, 1)
  t.ok(/'a'/.test(errors[0]))
  t.done()
})

test('two locals', t => {
  let errors = []
  function diag (desc) { errors.push(desc.message) }
  t.throws(() => compile('let a = b, b = a in a').test(1, { diag }))
  t.match(errors.length, 2)
  t.ok(/'b'/.test(errors[0]))
  t.ok(/'a'/.test(errors[1]))
  t.done()
})
