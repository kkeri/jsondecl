'use strict'

const test = require('tap').test
const _compile = require('../lib/index').compile
const model = require('../lib/model')

function compile(str) {
  return _compile(str, {
    filename: __filename,
    error: (str) => console.error('\n', str)
  })
}

test('simple value', t => {
  t.match(compile('1'), {
    defaultExport: {
      expr: {
        value: 1
      }
    }
  })
  t.match(compile('"a"'), {
    defaultExport: {
      expr: {
        value: "a"
      }
    }
  })
  t.match(compile('true'), {
    defaultExport: {
      expr: {
        value: true
      }
    }
  })
  t.match(compile('false'), {
    defaultExport: {
      expr: {
        value: false
      }
    }
  })
  t.match(compile('null'), {
    defaultExport: {
      expr: {
        value: null
      }
    }
  })
  t.done()
})

test('regex', t => {
  t.notEqual(compile('/a/'), null)
  t.notEqual(compile('/ abc/'), null)
  t.notEqual(compile('/a/i'), null)
  t.equal(compile('/a/g'), null)
  t.notEqual(compile('/\\//i'), null)
  t.notEqual(compile('/\t/'), null)
  t.notEqual(compile('/\\r\\n/'), null)
  t.equal(compile('/a/ghj'), null)
  t.done()
})

test('identifier', t => {
  t.match(compile('a'), null)
  t.match(compile('const a = 1; a'), {
    defaultExport: {
      expr: {
        // pattern: { value: 1 }
      }
    }
  })
  t.done()
})

test('import', t => {
  t.match(compile('import { } from "module/test.js"; 1'), {
    env: {
    }
  })
  t.match(compile('import { a } from "module/test.js"; 1'), {
    env: {
      a: { expr: { value: 3 } },
    }
  })
  t.match(compile('import { a, b } from "module/test.js"; 1'), {
    env: {
      a: { expr: { value: 3 } },
      b: { expr: { value: 99 } },
    }
  })
  t.match(compile('import { regex } from "module/test.js"; 1'), {
    env: {
      regex: { expr: { regexp: RegExp } }
    }
  })
  t.match(compile('import { nondef } from "module/test.js"; 1'), null)
  t.match(compile('import { undef } from "module/test.js"; 1'), null)
  t.match(compile('import { a, a } from "module/test.js"; 1'), null)
  t.match(compile('import { a } from "module/nofile.js"; 1'), null)
  t.done()
})

test('import rename', t => {
  t.match(compile('import { a as x } from "module/test.js"; 1'), {
    env: {
      x: { expr: { value: 3 } },
    }
  })
  t.match(compile('import { a as x, b } from "module/test.js"; 1'), {
    env: {
      x: { expr: { value: 3 } },
      b: { expr: { value: 99 } },
    }
  })
  t.done()
})

test('const', t => {
  t.match(compile('export const a = 1'), {
    env: {
      a: {
        expr: {
          value: 1
        }
      }
    },
    exports: {
      a: {
        expr: {
          value: 1
        }
      }
    },
    defaultExport: null
  })
  t.match(compile('export const a = 1; 2'), {
    env: {  
      a: {
        expr: { value: 1 }
      }
    },
    exports: {
      a: {
        expr: { value: 1 }
      }
    },
    defaultExport: {
      expr: { value: 2 }
    } 
  })
  t.match(compile('const a = 1; const a = 2'), null)
  t.match(compile('export const a = 1; const b = 2'), {
    env: {
      a: {
        expr: { value: 1 }
      },
      b: {
        expr: { value: 2 }
      }
    },
    exports: {
      a: {
        expr: { value: 1 }
      }
    },
    defaultExport: null
  })
  t.match(compile('export const a = 1 | 2'), {
    env: {
      a: {
        expr: {
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

test('const with comments', t => {
  t.match(compile('/**/export/**/const/**/a/**/=/**/1/**/'), {
    exports: {
      a: {
        expr: {
          value: 1
        }
      }
    },
  })
  t.match(compile('//\rexport//\rconst//\ra//\r=//\r1//\r'), {
    exports: {
      a: {
        expr: {
          value: 1
        }
      }
    },
  })
  t.match(compile('export const a = 1;/**/\t //'), {
    exports: {
      a: {
        expr: {
          value: 1
        }
      }
    },
  })
  t.done()
})

test('const with terminator', t => {
  t.match(compile('export const a = 1;/**/'), {
    exports: {
      a: {
        expr: {
          value: 1
        }
      }
    },
  })
  t.match(compile('export const a = 1;//'), {
    exports: {
      a: {
        expr: {
          value: 1
        }
      }
    },
  })
  t.match(compile('export const a = 1/**/;'), {
    exports: {
      a: {
        expr: {
          value: 1
        }
      }
    },
  })
  t.match(compile('export const a = 1/**/\r;'), {
    exports: {
      a: {
        expr: {
          value: 1
        }
      }
    },
  })
  t.match(compile('export const a = 1//\r;'), {
    exports: {
      a: {
        expr: {
          value: 1
        }
      }
    },
  })
  t.match(compile('export const a = 1\r;'), {
    exports: {
      a: {
        expr: {
          value: 1
        }
      }
    },
  })
  t.match(compile('export const a = 1\r \n '), {
    exports: {
      a: {
        expr: {
          value: 1
        }
      }
    },
  })
  t.done()
})

test('no export', t => {
  t.match(compile('const a = 1'), null)
  t.done()
})

test('object', t => {
  t.match(compile('{}'), {
    defaultExport: {
      expr: {
        propertyList: [
        ]
      }
    }
  })
  t.match(compile('{ a: b }'), null)
  t.match(compile('{ "a": "b" }'), {
    defaultExport: {
      expr: {
        propertyList: [
          {
            name: { value: "a" },
            value: { value: "b" }
          }
        ]
      }
    }
  })
  t.match(compile('{ "a": "b", "c": "d" }'), {
    defaultExport: {
      expr: {
        propertyList: [
          {
            name: { value: "a" },
            value: { value: "b" }
          },
          {
            name: { value: "c" },
            value: { value: "d" }
          }
        ]
      }
    }
  })
  t.done()
})

test('valid function call', t => {
  t.match(compile('closed({})'), {
    defaultExport: {
      expr: {
        // func: { doEval: Function, doTest: Function },
        args: [
          {
            propertyList: []
          }
        ]
      }
    }
  })
  t.match(compile('closed({ "a": 1 })'), {
    defaultExport: {
      expr: {
        // func: { doEval: Function, doTest: Function },
        args: [
          {
            propertyList: [
              { name: { value: "a" }, value: { value: 1 }}
            ]
          }
        ]
      }
    }
  })
  t.done()
})

test('let...in', t => {
  t.match(compile('let a = 1 in b'), null)
  t.match(compile('let a = 1 in a'), {
    defaultExport: {
      expr: {
        env: {
          a: { expr: { value: 1 }}
        },
        body: { id: 'a' }
      }
    }
  })
  t.match(compile('const x = 1; let a = x in a'), {
    defaultExport: {
      expr: {
        env: {
          a: { expr: { id: 'x' }}
        },
        body: { id: 'a' }
      }
    }
  })
  t.match(compile('export default let a = x in a; const x = 1'), {
    defaultExport: {
      expr: {
        env: {
          a: { expr: { id: 'x' }}
        },
        body: { id: 'a' }
      }
    }
  })
  t.done()
})
