'use strict'

const test = require('tap').test
const _compile = require('../lib/index').compile
const model = require('../lib/model')

function compile(str) {
  return _compile(str, {
    filename: __filename,
    error: (str) => console.log(str)
  })
}

test('simple value', t => {
  t.match(compile('1'), {
    defaultExport: {
      body: {
        value: 1
      }
    }
  })
  t.match(compile('"a"'), {
    defaultExport: {
      body: {
        value: "a"
      }
    }
  })
  t.match(compile('true'), {
    defaultExport: {
      body: {
        value: true
      }
    }
  })
  t.match(compile('false'), {
    defaultExport: {
      body: {
        value: false
      }
    }
  })
  t.match(compile('null'), {
    defaultExport: {
      body: {
        value: null
      }
    }
  })
  t.done()
})

test('identifier', t => {
  t.match(compile('a'), null)
  t.match(compile('const a = 1 a'), {
    defaultExport: {
      body: {
        func: { value: 1 }
      }
    }
  })
  t.done()
})

test('import', t => {
  t.match(compile('import { } from "module/test.js" 1'), {
    decls: {
    }
  })
  t.match(compile('import { a } from "module/test.js" 1'), {
    decls: {
      a: 3
    }
  })
  t.match(compile('import { a, b } from "module/test.js" 1'), {
    decls: {
      a: 3,
      b: 99
    }
  })
  t.match(compile('import { a } from "module/nofile.js" 1'), null)
  t.done()
})

test('const', t => {
  t.match(compile('export const a = 1'), {
    decls: {
      a: {
        body: {
          value: 1
        }
      }
    },
    exports: {
      a: {
        body: {
          value: 1
        }
      }
    },
    defaultExport: null
  })
  t.match(compile('export const a = 1 2'), {
    decls: {  
      a: {
        body: {
          value: 1
        }
      }
    },
    exports: {
      a: {
        body: {
          value: 1
        }
      }
    },
    defaultExport: {
      body: { value: 2 }
    } 
  })
  t.match(compile('const a = 1 const a = 2'), null)
  t.match(compile('export const a = 1 const b = 2'), {
    decls: {
      a: {
        body: { value: 1 }
      },
      b: {
        body: { value: 2 }
      }
    },
    exports: {
      a: {
        body: { value: 1 }
      }
    },
    defaultExport: null
  })
  t.match(compile('export const a = 1 | 2'), {
    decls: {
      a: {
        body: {
          items: [
            { value: 1 },
            { value: 2 }
          ]
        }
      }
    }
  })
  t.done()
})

test('no export', t => {
  t.match(compile('const a = 1'), null)
  t.done()
})
