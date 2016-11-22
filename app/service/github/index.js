const { Resource } = require('../../resource');

const Err = Resource.Error.create('GithubServiceError');

class GithubService extends Resource {
    prepareRequest(opts) {
        return Object.assign({
            protocol: 'https:',
            host: 'api.github.com',
            headers: {
                'user-agent': 'asker/1.x',
            },
            timeout: 1500,
        }, opts);
    }
}

GithubService.Error = Err;

module.exports = GithubService;
