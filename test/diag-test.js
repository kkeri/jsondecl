'use strict'

const test = require('tap').test
const _compile = require('../lib/index').compile
const model = require('../lib/model')

function compile (str, messages) {
  return _compile(str, {
    resolvePath: __dirname,
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
