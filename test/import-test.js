'use strict'

const test = require('tap').test
const _compile = require('../lib/index').compile
const model = require('../lib/model')

function compile(str) {
  return _compile(str, {
    filename: __filename
  })
}

test('import', t => {
  t.match(compile('import { a } from "./module/test"; a').test(3), true)
  t.match(compile('import { regex } from "./module/test"; regex').test('reg'), true)
  t.match(compile('import { a as x } from "./module/test"; x').test(3), true)
  t.done()
})
