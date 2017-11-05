'use strict'

const test = require('tap').test
const _compile = require('../lib/index').compile
const model = require('../lib/model')

function compile(str, diag) {
  return _compile(str, {
    filename: __filename,
    diag: diag
  })
}

test('info', t => {
  let diags = []
  let diag = function (desc) {
    diags.push(desc)
  }
  t.match(compile('import { test_info } from "module/test.js"; test_info')
    .test(1, { diag }), true)
  t.match(diags.length, 1)
  t.match(diags[0].severity, 'info')
  t.match(diags[0].message, 'test_info')
  t.done()
})

test('warning', t => {
  let diags = []
  let diag = function (desc) {
    diags.push(desc)
  }
  t.match(compile('import { test_warning } from "module/test.js"; test_warning')
    .test(1, { diag }), true)
  t.match(diags.length, 1)
  t.match(diags[0].severity, 'warning')
  t.match(diags[0].message, 'test_warning')
  t.done()
})

test('error', t => {
  let diags = []
  let diag = function (desc) {
    diags.push(desc)
  }
  t.match(compile('import { test_error } from "module/test.js"; test_error')
    .test(1, { diag }), false)
  t.match(diags.length, 1)
  t.match(diags[0].severity, 'error')
  t.match(diags[0].message, 'test_error')
  t.done()
})

test('mixed', t => {
  let diags = []
  let diag = function (desc) {
    diags.push(desc)
  }
  t.match(compile(`
    import { test_info, test_warning, test_error } from "module/test.js"
    test_info & test_warning & test_error
  `, diag).test(1, { diag }), false)
  t.match(diags.length, 3)
  t.match(diags[0].severity, 'info')
  t.match(diags[1].severity, 'warning')
  t.match(diags[2].severity, 'error')
  t.done()
})
