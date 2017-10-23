## parser

- unescape string literals

## model

## sets

- inclusion test

Wish list:
- the user may import and provide sets as runtime parameters
- a user provided set may be either a plain object or an ES6 Set
- a failed test shouldn't modify a user defined set

## compiler

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

- add warn()

## to be decided

- what is the default cardinality for property patterns : 1 or +?
- what is the default mode on file testing: allow repeated property names?

## perspectives

- default value for absent properties
- arithmetic expressions and constraints
- compilation to javascript
