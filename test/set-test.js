'use strict'

const test = require('tap').test
const _compile = require('../lib/index').compile
const model = require('../lib/model')

function compile (str) {
  const messages = []
  return _compile(str, {
    filename: __filename,
    messages
  })
}

test('uniqueness', t => {
  t.match(compile('const s = set; 1').match(1), true)
  t.match(compile('const s = 1; { "a": unique(s) }').match({ a: 1 }), false)
  t.match(compile('const s = set; { "a": unique(s) }').match({ a: 1 }), true)
  t.match(compile('const s = set; { "a": unique(s), "b": unique(s) }')
  .match({ a: 1, b: 1 }), false)
  t.match(compile('const s = set; { "a": unique(s), "b": unique(s) }')
  .match({ a: 1, b: 2 }), true)
  t.match(compile('const s = set; { "a": unique(s), "c": any } | { "b": unique(s) }')
  .match({ a: 1, b: 1 }), true)
  t.match(compile('const s = set; { "a": unique(s) } | { "a": unique(s) }')
  .match({ a: 1 }), true)
  t.match(compile('const s = set; { "a": unique(s) } & { "a": unique(s) }')
  .match({ a: 1 }), true)

  t.done()
})

test('uniqueness2', t => {
  t.match(compile(`
    const s = set
    const t = set
    { "type": "s", "value": unique(s) } | { "type": "t", "value": unique(t) }
  `).match({ type: 's', value: 1 }), true)
  t.match(compile(`
    const s = set
    const t = set
    { "type": "s", "value": unique(s) } | { "type": "t", "value": unique(t) }
  `).match({ type: 't', value: 1 }), true)
  t.match(compile(`
    const s = set
    const t = set
    { "type": "s", "value": unique(s) } | { "type": "t", "value": unique(t) }
  `).match({ type: 'u', value: 1 }), false)
  t.match(compile(`
    const s = set
    const t = set
    closed([
      { "type": "s", "value": unique(s) } | { "type": "t", "value": unique(t) }*
    ])
  `).match([
    { type: 's', value: 1 },
    { type: 't', value: 1 }
  ]), true)
  t.match(compile(`
    const s = set
    const t = set
    closed([
      { "value": unique(s), "type": "s" } | { "value": unique(t), "type": "t" }*
    ])
  `).match([
    { type: 's', value: 1 },
    { type: 't', value: 1 }
  ]), true)

  t.done()
})

test('set inclusion', t => {
  t.match(compile('const s = set; elementof(s)').match(1), false)
  t.match(compile('const s = 1; elementof(s)').match(1), false)
  t.match(compile('const s = set; unique(s) & elementof(s)').match(1), true)
  t.match(compile('const s = set; elementof(s) & unique(s)').match(1), false)
  t.match(compile('const s = set; { "a": unique(s) } & { "b": elementof(s) }')
  .match({ a: 9, b: 9 }), true)
  t.match(compile('const s = set; { "a": unique(s) } & { "b": elementof(s) }')
  .match({ a: 9, b: 7 }), false)

  t.done()
})
