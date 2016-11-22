const assert = require('assert');
const port = process.env.port || process.env.PORT;
assert.ok(port, 'PORT not specified');
require('./app')(port);
