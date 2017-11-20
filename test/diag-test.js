'use strict'

const test = require('tap').test
const _compile = require('../lib/index').compile
const model = require('../lib/model')
const RuntimeError = require('../lib/diag').RuntimeError

function compile (str, messages) {
  return _compile(str, {
    baseDir: __dirname,
    messages: messages
  })
}

test('info', t => {
  let messages = []
  t.match(compile('import { test_info } from "./module/test.js"; test_info')
    .test(1, { messages }), true)
  t.match(messages.length, 1)
  t.match(messages[0].severity, 'info')
  t.match(messages[0].message, 'test_info')
  t.done()
})

test('warning', t => {
  let messages = []
  t.match(compile('import { test_warning } from "./module/test.js"; test_warning')
    .test(1, { messages }), true)
  t.match(messages.length, 1)
  t.match(messages[0].severity, 'warning')
  t.match(messages[0].message, 'test_warning')
  t.done()
})

test('error', t => {
  let messages = []
  t.match(compile('import { test_error } from "./module/test.js"; test_error')
    .test(1, { messages }), false)
  t.match(messages.length, 1)
  t.match(messages[0].severity, 'error')
  t.match(messages[0].message, 'test_error')
  t.done()
})

test('mixed', t => {
  let messages = []
  t.match(compile(`
    import { test_info, test_warning, test_error } from "./module/test.js"
    test_info & test_warning & test_error
  `, messages).test(1, { messages }), false)
  t.match(messages.length, 3)
  t.match(messages[0].severity, 'info')
  t.match(messages[1].severity, 'warning')
  t.match(messages[2].severity, 'error')
  t.done()
})

test('illegal use of expression as pattern', t => {
  t.throws(function () { compile('set').test(1) }, RuntimeError)

  t.done()
})

test('illegal call', t => {
  t.throws(function () {
    compile('const x = 1; x()').test(1) 
  }, RuntimeError)

  t.done()
})

test('illegal property ref', t => {
  t.throws(function () {
    compile('const x = 1; x.a').test(1) 
  }, RuntimeError)

  t.done()
})

test('illegal argument to native pattern', t => {
  t.throws(function () {
    compile('lt({})').test(1) 
  }, RuntimeError)

  t.done()
})

test('illegal reference', t => {
  t.throws(function () {
    compile('a').test(1) 
  }, RuntimeError)

  t.done()
})
