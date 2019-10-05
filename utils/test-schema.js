var fs = require('fs');
var Ajv = require('ajv');
var ajv = new Ajv();
var validate = ajv.compile(JSON.parse(fs.readFileSync(process.argv[2], { encoding: "utf8" })));
var valid = validate(JSON.parse(fs.readFileSync(process.argv[3], { encoding: "utf8" })));
if (!valid) {
    console.log("Error with " + process.argv[2] + " / " + process.argv[3]);
    console.error(validate.errors);
    process.exit(1);
}
