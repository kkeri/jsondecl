## language

- unescape string literals
- functions
- support all forms of ES6 import
- exclusive or combinator (oneOf)

## sets

- set lifetime should be the same as transaction lifetime

Wish list:
- the user may import and provide sets as runtime parameters
- a user provided set may be either a plain object or an ES6 Set
- a failed test shouldn't modify a user defined set

## modules

- function for setting default options

## contexts

- assign source location to diagnostic messages

## compiler

- mutual dependency between modules
- warning: cardinality defined on empty array pattern
- handle error location
- dynamic cardinality
- static evaluation as compilation and optimization technique

## optimization

- eliminate simple identifier renamings
- protect the default export from multiple evaluation

## runtime

- env object without standard prototype
- add exception handling to native patterns and macros

## diagnostics

- proper diagnostic messages from the parser
- diagnostics should be transactional (except fatal errors)
- custom error formatter (the user may want error messages that refer to the 
  validated data but not to jsondl)
- emit diagnostic messages from native validators

## native validators

- implement errorlevel (warn)

## to be decided

- what is the default cardinality for property patterns : 1 or +?
- what is the default mode on file testing: allow repeated property names?

## perspectives

- strict mode (ban extra properties and array elements)
- array sections [ ] :: [ ]
- default value for absent properties
- arithmetic expressions and constraints
- compilation to javascript

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

- pattern matching
  - order of evaluation
  - matching repeated array patterns (why closed is important)

- extendibility

- examples
  - graph declaration (nodes and edges)
  - package.json
