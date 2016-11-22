const resource = require('../resource');
const { tracer } = require('../tracer');
const { APP_NAME } = require('../config');

module.exports = resource.build(__dirname, { tracer, serviceName: APP_NAME });
