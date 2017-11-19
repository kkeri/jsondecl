'use strict'

const test = require('tap').test
const jsondl = require('../lib/index')
const model = require('../lib/model')

function compile (str) {
  const messages = []
  return jsondl.compile(str, {
    baseDir: __dirname,
    messages
  })
}

test('import syntax error', t => {
  t.match(compile('importrgb from "./module/colors.jsondl"; rgb'), null)
  t.match(compile('import rgbfrom "./module/colors.jsondl"; rgb'), null)
  t.match(compile('import * asall from "./module/colors.jsondl"; rgb'), null)
  t.match(compile('import { aas b } from "./module/colors.jsondl"; rgb'), null)
  t.match(compile('import { a asb } from "./module/colors.jsondl"; rgb'), null)
  t.done()
})

test('package not found', t => {
  const messages = []
  t.match(jsondl.compile('import { a } from "jsondl-non-existing-module-for-test"; 1', {
    baseDir: __dirname,
    messages
  }), null)
  t.match(messages.length, 1)
  t.match(messages[0].severity, 'error')
  t.ok(/jsondl-non-existing-module-for-test/.test(messages[0].message))
  t.done()
})

test('relative path not found', t => {
  const messages = []
  t.match(jsondl.compile('import { a } from "./module/nomodule.js"; 1', {
    baseDir: __dirname,
    messages
  }), null)
  t.match(messages.length, 1)
  t.match(messages[0].severity, 'error')
  t.ok(/\.\/module\/nomodule\.js/.test(messages[0].message))
  t.done()
})

test('unix absolute path not found', t => {
  const messages = []
  t.match(jsondl.compile('import { a } from "/__no-such-topdir__/__no-such-subdir__/__no-such-file.js"; 1', {
    baseDir: __dirname,
    messages
  }), null)
  t.match(messages.length, 1)
  t.match(messages[0].severity, 'error')
  t.ok(/\/__no-such-topdir__\/__no-such-subdir__\/__no-such-file\.js/.test(messages[0].message))
  t.done()
})

test('windows absolute path not found', t => {
  const messages = []
  t.match(jsondl.compile('import { a } from "X:\__no-such-topdir__\__no-such-subdir__\__no-such-file.js"; 1', {
    baseDir: __dirname,
    messages
  }), null)
  t.match(messages.length, 1)
  t.match(messages[0].severity, 'error')
  t.ok(/X:\__no-such-topdir__\__no-such-subdir__\__no-such-file.js/.test(messages[0].message))
  t.done()
})

test('import jsondl', t => {
  t.match(compile('import { rgb } from "./module/colors.jsondl"; rgb').test('red'), true)
  t.match(compile('import { rgb } from "./module/colors"; rgb').test('red'), true)
  t.match(compile('import { x } from "./module/no-ext-jsondl"; x').test('no-ext'), true)
  t.done()
})

test('import js', t => {
  t.match(compile('import { a } from "./module/test.js"; a').test(3), true)
  t.match(compile('import { regex } from "./module/test.js"; regex').test('reg'), true)
  t.match(compile('import { a as x } from "./module/test.js"; x').test(3), true)
  t.done()
})

test('import default binding', t => {
  t.match(compile('import def from "./module/exports"; def').test('default-export'), true)
  t.done()
})

test('namespace import', t => {
  t.match(compile('import * as all from "./module/exports"; all.default').test('default-export'), true)
  t.match(compile('import * as all from "./module/exports"; all.a').test(1), true)
  t.match(compile('import * as all from "./module/exports"; all.b').test(2), true)
  t.done()
})

test('import list', t => {
  t.match(compile('import { } from "./module/test.js"; 1'), {
    env: {
    }
  })
  t.match(compile('import { a } from "./module/test.js"; 1'), {
    env: {
      a: { value: 3 }
    }
  })
  t.match(compile('import { a, b } from "./module/test.js"; 1'), {
    env: {
      a: { value: 3 },
      b: { value: 99 }
    }
  })
  t.match(compile('import { regex } from "./module/test.js"; 1'), {
    env: {
      regex: { regexp: RegExp }
    }
  })
  t.match(compile('import { nondef } from "./module/test.js"; 1'), null)
  t.match(compile('import { undef } from "./module/test.js"; 1'), null)
  t.match(compile('import { a, a } from "./module/test.js"; 1'), null)
  t.match(compile('import { a } from "./module/nofile.js"; 1'), null)
  t.done()
})

test('import rename', t => {
  t.match(compile('import { a as x } from "./module/test.js"; 1'), {
    env: {
      x: { value: 3 }
    }
  })
  t.match(compile('import { a as x, b } from "./module/test.js"; 1'), {
    env: {
      x: { value: 3 },
      b: { value: 99 }
    }
  })
  t.done()
})
