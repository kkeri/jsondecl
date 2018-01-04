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

// validation errors

test('info', t => {
  let messages = []
  t.match(compile('import { test_info } from "./module/test.js"; test_info')
    .match(1, { messages }), true)
  t.match(messages.length, 1)
  t.match(messages[0].severity, 'info')
  t.match(messages[0].message, 'test_info')
  t.done()
})

test('warning', t => {
  let messages = []
  t.match(compile('import { test_warning } from "./module/test.js"; test_warning')
    .match(1, { messages }), true)
  t.match(messages.length, 1)
  t.match(messages[0].severity, 'warning')
  t.match(messages[0].message, 'test_warning')
  t.done()
})

test('error', t => {
  let messages = []
  t.match(compile('import { test_error } from "./module/test.js"; test_error')
    .match(1, { messages }), false)
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
  `, messages).match(1, { messages }), false)
  t.match(messages.length, 3)
  t.match(messages[0].severity, 'info')
  t.match(messages[1].severity, 'warning')
  t.match(messages[2].severity, 'error')
  t.done()
})

test('closed array', t => {
  let messages = []
  t.match(compile(`closed([number])`, messages).match([1, 2], { messages }), false)
  t.match(messages.length, 1)
  t.match(messages[0].severity, 'error')
  t.done()
})

test('closed object', t => {
  let messages = []
  t.match(compile(`closed({ "a" })`, messages).match({ 'a': 1, 'b': 2 }, { messages }), false)
  t.match(messages.length, 1)
  t.match(messages[0].severity, 'error')
  t.done()
})

test('unique', t => {
  let messages = []
  t.match(compile(`unique(1)`, messages).match([1, 1], { messages }), false)
  t.match(messages.length, 1)
  t.match(messages[0].severity, 'error')
  messages = []
  t.match(compile(`const s = set; [unique(s){2}]`, messages).match([1, 1], { messages }), false)
  t.match(messages.length, 1)
  t.match(messages[0].severity, 'error')
  t.done()
})

test('elementof', t => {
  let messages = []
  t.match(compile(`elementof(1)`, messages).match(1, { messages }), false)
  t.match(messages.length, 1)
  t.match(messages[0].severity, 'error')
  messages = []
  t.match(compile(`const s = set; elementof(s)`, messages).match(1, { messages }), false)
  t.match(messages.length, 1)
  t.match(messages[0].severity, 'error')
  t.done()
})

// runtime errors

test('illegal use of expression as pattern', t => {
  t.throws(function () { compile('set').match(1) }, RuntimeError)

  t.done()
})

test('illegal call', t => {
  t.throws(function () {
    compile('const x = 1; x()').match(1) 
  }, RuntimeError)

  t.done()
})

test('illegal property ref', t => {
  t.throws(function () {
    compile('const x = 1; x.a').match(1) 
  }, RuntimeError)

  t.done()
})

test('illegal argument to native pattern', t => {
  t.throws(function () {
    compile('lt({})').match(1) 
  }, RuntimeError)

  t.done()
})

test('illegal reference', t => {
  t.throws(function () {
    compile('a').match(1) 
  }, RuntimeError)

  t.done()
})

test('no standard object prototype', t => {
  t.throws(function () {
    compile('toString').match(1) 
  }, RuntimeError)

  t.done()
})
