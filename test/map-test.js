'use strict'

const test = require('tap').test
const TransactionalMap = require('../lib/map').TransactionalMap
const RuntimeContext = require('../lib/runtime').RuntimeContext

test('empty map', t => {
  let rc = new RuntimeContext()

  let map = new TransactionalMap(rc)
  // t.match(map.size(), 0)
  t.match(map.has(1), false)
  t.match(map.get(1), undefined)

  t.done()
})

test('single item', t => {
  let rc = new RuntimeContext()

  let map = new TransactionalMap(rc)
  map.set(1, 2)
  // t.match(map.size(), 1)
  t.match(map.has(1), true)
  t.match(map.get(1), 2)

  map.set(1, 3)
  // t.match(map.size(), 1)
  t.match(map.has(1), true)
  t.match(map.get(1), 3)

  t.done()
})

test('two items', t => {
  let rc = new RuntimeContext()

  let map = new TransactionalMap(rc)
  map.set(1, 2)
  map.set(2, 4)
  // t.match(map.size(), 2)
  t.match(map.has(1), true)
  t.match(map.has(2), true)
  t.match(map.get(1), 2)
  t.match(map.get(2), 4)

  t.done()
})

test('eval', t => {
  let rc = new RuntimeContext()

  let map = new TransactionalMap(rc)
  t.equal(map.eval(rc), map)

  t.done()
})

test('rollback1', t => {
  let rc = new RuntimeContext()

  let map = new TransactionalMap(rc)

  rc.begin()
  map.set(1, 3)
  t.match(map.has(1), true)
  t.match(map.get(1), 3)

  rc.rollback()
  t.match(map.has(1), false)

  t.done()
})

test('rollback2', t => {
  let rc = new RuntimeContext()

  let map = new TransactionalMap(rc)
  map.set(1, 2)

  rc.begin()
  map.set(1, 3)
  // t.match(map.size(), 1)
  t.match(map.has(1), true)
  t.match(map.get(1), 3)

  rc.rollback()
  // t.match(map.size(), 1)
  t.match(map.has(1), true)
  t.match(map.get(1), 2)

  t.done()
})

test('succeed1', t => {
  let rc = new RuntimeContext()

  let map = new TransactionalMap(rc)

  rc.begin()
  map.set(1, 3)
  t.match(map.has(1), true)
  t.match(map.get(1), 3)

  rc.succeed()
  t.match(map.has(1), true)
  t.match(map.get(1), 3)

  t.done()
})

test('succeed2', t => {
  let rc = new RuntimeContext()

  let map = new TransactionalMap(rc)
  map.set(1, 2)

  rc.begin()
  map.set(1, 3)
  t.match(map.has(1), true)
  t.match(map.get(1), 3)

  rc.succeed()
  t.match(map.has(1), true)
  t.match(map.get(1), 3)

  t.done()
})
