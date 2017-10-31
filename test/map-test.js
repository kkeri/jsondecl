'use strict'

const test = require('tap').test
const TransactionalMap = require('../lib/map').TransactionalMap
const TestContext = require('../lib/context').TestContext

test('empty map', t => {
  let tc = new TestContext()

  let map = new TransactionalMap(tc)
  // t.match(map.size(), 0)
  t.match(map.has(1), false)
  t.match(map.get(1), undefined)

  t.done()
})

test('single item', t => {
  let tc = new TestContext()

  let map = new TransactionalMap(tc)
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
  let tc = new TestContext()

  let map = new TransactionalMap(tc)
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
  let tc = new TestContext()

  let map = new TransactionalMap(tc)
  t.equal(map.doEval(tc), map)

  t.done()
})

test('rollback1', t => {
  let tc = new TestContext()

  let map = new TransactionalMap(tc)

  tc.begin()
  map.set(1, 3)
  t.match(map.has(1), true)
  t.match(map.get(1), 3)

  tc.rollback()
  t.match(map.has(1), false)

  t.done()
})

test('rollback2', t => {
  let tc = new TestContext()

  let map = new TransactionalMap(tc)
  map.set(1, 2)

  tc.begin()
  map.set(1, 3)
  // t.match(map.size(), 1)
  t.match(map.has(1), true)
  t.match(map.get(1), 3)

  tc.rollback()
  // t.match(map.size(), 1)
  t.match(map.has(1), true)
  t.match(map.get(1), 2)

  t.done()
})

test('commit1', t => {
  let tc = new TestContext()

  let map = new TransactionalMap(tc)

  tc.begin()
  map.set(1, 3)
  t.match(map.has(1), true)
  t.match(map.get(1), 3)

  tc.commit()
  t.match(map.has(1), true)
  t.match(map.get(1), 3)
  
  t.done()
})

test('commit2', t => {
  let tc = new TestContext()

  let map = new TransactionalMap(tc)
  map.set(1, 2)

  tc.begin()
  map.set(1, 3)
  t.match(map.has(1), true)
  t.match(map.get(1), 3)

  tc.commit()
  t.match(map.has(1), true)
  t.match(map.get(1), 3)

  t.done()
})
