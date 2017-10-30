## parser

- {1..2} -> {1,2}
- introduce {n,} to denote at least n occurences
- unescape string literals
- support all forms of ES6 import

## model

- exclusive or combinator (oneOf)

## sets

- write those unit tests

Wish list:
- the user may import and provide sets as runtime parameters
- a user provided set may be either a plain object or an ES6 Set
- a failed test shouldn't modify a user defined set

## compiler

- warning: cardinality defined on empty array pattern
- how to pass errors to the user
- handle error location
- dynamic cardinality
- static evaluation as compilation and optimization technique

## optimization

- eliminate simple renamings
- what about circular references?

## runtime

- add exception handling to native patterns and macros
- add error output to Module.test()

## native patterns

- inside -> member or element
- add warn()

## to be decided

- what is the default cardinality for property patterns : 1 or +?
- what is the default mode on file testing: allow repeated property names?

## perspectives

- array sections [ ] :: [ ]
- default value for absent properties
- arithmetic expressions and constraints
- compilation to javascript

## docs

- API

- module structure
  - import
  - declaration types
  - values and patterns


- patterns
  - types
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
