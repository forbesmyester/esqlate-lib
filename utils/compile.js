var compileFromFile = require('json-schema-to-typescript').compileFromFile;
var fs = require('fs');

compileFromFile(process.argv[2])
  .then(ts => fs.writeFileSync(process.argv[3], ts))

// or, compile a JS object
// let mySchema = {
//   properties: [...]
// }
// compile(mySchema, 'MySchema')
//   .then(ts => ...)
