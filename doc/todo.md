## refactor

## language

- unescape string literals
- support functions
- support all forms of ES6 import
- exclusive or combinator (oneOf)
- support single quoted strings?
- support full set of ES6 identifiers?
- verify that JSONDL is superset of JSON (character set compatibility!)

## model

- clarify evaluation strategy of strict compound objects (no eval in test)
- verify that this can't be used as pattern
- set lifetime should be the same as transaction lifetime

## modules

- custom module resolver can be passed on Loader construction

## compiler

- precise error reporting from the parser (report multiple errors)
- handle error location
- static evaluation as compilation and optimization technique
- dynamic cardinality?

## optimization

- eliminate simple identifier renamings

## runtime

- verify that declarations are evaluated only once (and also default exports)
- make the global JS environment accessible from JSONDL?
- support calling native functions
- unify the Callable interface?
- warning: cardinality defined on empty array pattern
- assign stack trace to runtime errors

## diagnostics

- proper diagnostic messages from the parser (using ohm internals)
- assign source location to diagnostic messages
- validation diagnostics should be transactional
- custom error formatter (the user may want error messages that refer to the 
  validated data but not to jsondl)

## native extensions

- pass rc as a parameter instead of this
- exception handling when calling native extensions
- implement errorlevel (warn)
- emit diagnostic messages from built in extensions

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
