# JSONDL - a JSON declaration language

A domain specific language to document and validate JSON data in your
JavaScript projects.

JSONDL is natural and javascripty. It is simple like this:

`person.jsondl`:

~~~jsondl
{
    "name": string,
    "age": number
}
~~~

`app.js`:

~~~js
var jsondl = require('jsondl')

var personDecl = jsondl.load(require.resolve('./person.jsondl'))

if (personDecl.test({ name: 'Dan', age: '25' })) {
    console.log('Wow!')
}
~~~


## What is JSONDL?

A programming language that lets you declare your JSON data.  
JSONDL is a superset of JSON, meaning that any JSON file is its own declaration.

## What is a JSON declaration?

A convenient way to document your JSON data: its structure, types and constraints.  
It is also a precise specification that can be fed into a JSON validator.

JSON declarations are essentially data patterns. A JSON instance is valid if it
matches a particular pattern.


## Benefits

**Readable** - Declarations look similarly to validated data.
You can actually develop a JSON declaration by editing a JSON file.

**Intuitive** - JSONDL is much like a type system for JSON.
If you like [Flow](https://flow.org/) or [Typescript](https://www.typescriptlang.org/),
you will find it familiar.

**Modular** - Use ES6 imports and exports in your JSONDL files.
Organize your declarations as any other code.
No more intangible dependencies.

**Extendable** - Write your own extensions in JavaScript.
The simplest kind of custom validator is just a function that accepts a single argument and
returns true or false.
Import your Javascript extensions directly into JSONDL.

**Scalable** - Publish your declarations and extensions as JavaScript packages
and let others import or require them in their own projects.


*JSONDL is work in progress.
For more features, please look at functional tests in the `test` directory.*

# Installation

    npm install jsondl

# License

MIT
