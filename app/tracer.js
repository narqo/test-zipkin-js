const { Tracer, ConsoleRecorder } = require('zipkin');
const CLSContext = require('zipkin-context-cls');

const ctxImpl = new CLSContext('zipkin');
const recorder = new ConsoleRecorder();

exports.tracer = new Tracer({ ctxImpl, recorder });
