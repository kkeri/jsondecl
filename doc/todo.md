## refactor

## language

- unescape string literals
- replace const with let?
- support functions
- support all forms of ES6 import
- exclusive or combinator (oneOf)
- support single quoted strings?
- dynamic cardinality?
- support full set of ES6 identifiers?
- verify that JSONDL is superset of JSON (character set compatibility!)

## model

- declaration expressions must have their own validate methods
- clarify evaluation strategy of strict compound objects (no eval in test)
- verify that this can't be used as pattern
- set lifetime should be the same as transaction lifetime
- default set assigned to properties, array items

## modules

- custom module resolver can be passed on Loader construction

## compiler

- handle error location

## optimization

- eliminate simple identifier renamings
- static evaluation as compilation and optimization technique
- define a separate model class for property patterns whose key is a string 

## runtime

- verify that sets behave correctly in case of nested transactions, where not
  each transaction adds to the set
- verify that declarations are evaluated only once (and also default exports)
- make the global JS environment accessible from JSONDL?
- support calling native functions
- unify the Callable interface?
- optional cycle detection

## diagnostics

- proper diagnostic messages from the parser (using ohm internals)
- warn if maxCount < minCount
- warn if maxCount or minCount < 0
- better presentation of this.value in Literal (at least "" around string values)
- warning: non-trivial repetition defined on nullable array pattern (without surrounding closed)
- assign source location to diagnostic messages
- assign stack trace to runtime errors
- full call stack in diagnostic messages
- custom error formatter (the user may want error messages that refer to the 
  validated data but not to jsondl)

## cli

- error messages with filename and json path
- option: file encoding
- warn if no command given
- return with proper result code

## native extensions

- pass rc as a parameter instead of this to native patterns
- emit diagnostic messages from built in extensions
- rename unique to uniquein?
- implement errorlevel (warn)

## to be decided

- what is the default cardinality for property patterns : 1 or +?
- what is the default mode on file testing: allow repeated property names?

## perspectives

- strict mode (ban extra properties and array elements)
- use .d.ts files as declarations
- array sections [ ] :: [ ]
- setting default value for absent properties
- arithmetic expressions and constraints
- compilation to javascript

set wish list:
- the user may import and provide sets as runtime parameters
- a user provided set may be either a plain object or an ES6 Set
- a failed test shouldn't modify a user defined set

## docs

- API
  - compilation
  - validation
  - error reporting

- module structure
  - import
  - declaration types
  - values and patterns


- patterns
  - types
    - arrays
      - empty array patterns and cardinality  
  - combinators
  - functions and macros
  - uniqueness
  - closedness

- Runtime
  - runtime errors

- pattern matching
  - order of evaluation
  - matching repeated array patterns (why closed is important)

- extendibility

- examples
  - graph declaration (nodes and edges)
  - package.json
