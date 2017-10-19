# JSONDL - a JSON declaration language

A domain specific language to document and validate JSON data in your
JavaScript projects.

JSONDL is natural and javascripty. It is simple like this.

`person.jsondl`:

~~~jsondl
{
    "name": string,
    "age": number
}
~~~

`app.js`:

~~~js
var fs = require('fs')
var jsondl = require('jsondl')

var personDecl = jsondl.compile(fs.readFileSync('person.jsondl', 'utf8'))

if (personDecl.test({ name: 'Dan', age: '25' })) {
    console.log('Wow!')
}
~~~


*JSONDL is pre-alpha.
To see more of its features, please look at functional tests in `test/run-test.js`.*

