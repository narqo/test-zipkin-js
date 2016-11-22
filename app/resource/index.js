const fs = require('fs');
const path = require('path');
const Resource = require('./resource');

function loadResource(name) {
    try {
        return Promise.resolve(require(name));
    } catch (e) {
        console.error(e);
        throw Promise.reject(e);
    }
}

function resourceBuilder(resourcesPath, { tracer, serviceName = 'unknown' }) {
    resourcesPath = path.resolve(resourcesPath);

    return function resource(name, args, params) {
        const [resourceName, method = 'get'] = name.split('.');

        return loadResource(path.join(resourcesPath, resourceName)).then(rCls => {
            const instance = new rCls(tracer, Object.assign({ name: resourceName }, params, { serviceName }));
            return instance.invoke(method, args);
        });
    };
}

module.exports = {
    build: resourceBuilder,
    Resource,
};
