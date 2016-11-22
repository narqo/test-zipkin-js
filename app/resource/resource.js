const ask = require('asker');
const Terror = require('terror');
const { HttpHeaders: Header, Annotation } = require('zipkin');

const Err = Terror.create('ResourceError', {
    UNKNOWN_METHOD: 'Unknown method <%resource%>: "%method%"',
    INVALID_JSON: 'Invalid JSON <%resource%> %message%: %rawresponse%',
});

class Resource {
    constructor(tracer, { serviceName, name }) {
        this.tracer = tracer;
        this.traceId = null;
        this.serviceName = serviceName;
        this.name = name;
    }

    invoke(method, args) {
        return new Promise((resolve, reject) => {
            if (typeof this[method] !== 'function') {
                return reject(Err.createError(Err.CODES.UNKNOWN_METHOD));
            }
            return resolve(this[method].call(this, args));
        });
    }

    get(opts) {
        return this
            .doRequest(this.prepareRequest(opts))
            .then(resp => {
                try {
                    return JSON.parse(resp.data.toString());
                } catch (e) {
                    return Promise.reject(
                        Err.createError(Err.CODES.INVALID_JSON)
                            .bind({
                                message: e,
                                rawresponse: resp.data
                            })
                    );
                }
            });
    }

    prepareRequest(opts) {
        return opts;
    }

    doRequest(req) {
        const { tracer } = this;

        tracer.scoped(() => {
            tracer.setId(tracer.createChildId());
            const traceId = tracer.id;
            this.traceId = traceId;

            const { headers = {} } = req;
            headers[Header.TraceId] = traceId.traceId;
            headers[Header.SpanId] = traceId.spanId;
            traceId._parentId.ifPresent(psid => {
                req.headers[Header.ParentSpanId] = psid;
            });
            traceId.sampled.ifPresent(sampled => {
                req.headers[Header.Sampled] = sampled ? '1' : '0';
            });
            req.headers = headers;

            const { method = 'get' } = req;
            tracer.recordServiceName(this.serviceName);
            tracer.recordRpc(method.toUpperCase());
            tracer.recordBinary('http.url', req.path || '/');
            tracer.recordAnnotation(new Annotation.ClientSend());
            tracer.recordAnnotation(new Annotation.ServerAddr({
                serviceName: this.name,
                host: req.host,
                port: req.port,
            }));
        });

        return new Promise((resolve, reject) => {
            ask(req, (err, resp) => {
                tracer.scoped(() => {
                    tracer.setId(this.traceId);
                    tracer.recordBinary('http.status_code', resp.statusCode.toString());
                    tracer.recordAnnotation(new Annotation.ClientRecv());
                });
                if (err !== null) {
                    reject(err);
                } else {
                    resolve(resp);
                }
            });
        });
    }
}

Resource.Error = Err;
module.exports = Resource;
