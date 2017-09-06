
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

