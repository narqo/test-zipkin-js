const BaseService = require('./');

class GithubUsersService extends BaseService {
    prepareRequest() {
        return super.prepareRequest({ path: '/users' });
    }
}

module.exports = GithubUsersService;
