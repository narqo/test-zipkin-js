const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { expressMiddleware: zipkinMiddleware } = require('zipkin-instrumentation-express');
const { APP_NAME } = require('./config');
const { errorMiddleware } = require('./error');
const { tracer } = require('./tracer');
const service = require('./service');

const app = express();
app.disable('x-powered-by');
app.enable('trust proxy');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(zipkinMiddleware({ tracer, serviceName: APP_NAME }));

app.get('/', function(req, res, next) {
    service('github/users')
        .then(resp => res.json(resp))
        .catch(next);
});

app.use(errorMiddleware());

process.on('disconnect', () => {
    console.log({ msg: 'exiting...' });
});

module.exports = port => http.createServer(app).listen(port);
