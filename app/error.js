const Terror = require('terror');
const AppError = Terror.create('AppError');

const STATUS_UNHANDLED_ERROR = 520;

exports.AppError = AppError;

exports.errorMiddleware = function errorMiddleware(opts = {}) {
    return function(err, req, res, next) {
        AppError.ensureError(err).log();
        res.status(err.statusCode || STATUS_UNHANDLED_ERROR);
        res.end(opts.debug ? `<pre>${err.stack}</pre>` : 'Unhandled Server Error');
    };
};
