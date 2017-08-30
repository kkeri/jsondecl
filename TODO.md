## parser

- unescape string literals
- make export an optional modifier for declarations
- imports and automatic default export anywhere in the file
- property cardinality
- ellipsis ... to denote an open object pattern

## model

- remove the abstract class Expression
- introduce runtime contexts

## compiler

- look up names also in embedding contexts
- dynamic cardinality

## optimization

- eliminate simple renamings

## to be decided

- which is the default for object patterns: closed or open?
- what is the default cardinality for property patterns : 1 or +?
- what is the default mode on file testing: allow repeated property names?

