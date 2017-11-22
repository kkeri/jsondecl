
# All names should come from the lexical context

A few languages adopt the concept of dynamic name binding where a name is
possibly resolved in the caller environment.
An example is dynamic scoping in Lisp. However the concept never found full
acceptance among programmers because its effects are hard to follow unless used
with extreme care. It's particularly not a good idea to have an API function
depend on the caller context because it is called from a foreign environment.

I conclude that the only favorable way a callee should depend on its caller
is through function parameters. This way names are always resolved in the
lexical context (i.e. in the same module).

It's also preferred that global names are not injected into the module but
properly imported.

# Values and patterns are declared using the same keyword

Not only they are declared by the same keyword, but the compiler and the
runtime makes no distinction between value and pattern expression until it is
strictly necessary, that is until an expression appears in a position where
a pattern is expected.

To illustrate this, consider numbers that we naturally treat as values.
If JSONDL will ever support arithmetic operators, it will be possible to write
things like this:

~~~js
const x = 1 + 2
~~~

On the other hand, numbers can be used as JSONDL patterns too.

~~~js
const FRUIT = 1
const FLOWER = 2
{ "kind": FRUIT, "taste": string } | { "kind": FLOWER, "smell": string }
~~~

Distinguishing between these use cases would introduce limitations to the
language, enforcing extra administration on the programmer.
For example, some values should have been declared twice that would clearly
violate the DRY principle.

Instead of that, the following approach is taken: all expressions support the
*eval* operation that produces the strict value of the expression
(a value that cannot be simplified further). This also applies to combinators
whose strict values are themselves. In addition, some expression types support
the *test* operation that validates a value against the expression.
Those expressions are called patterns.
In practice all built-in JSONDL expressions are valid patterns, except for
`this`.



