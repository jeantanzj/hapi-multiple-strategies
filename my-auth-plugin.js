const Boom = require('boom')
const name = 'my-auth-plugin'
const version = '1.0.0'
const myMethod = function (server, options) {
    const settings = Object.assign({}, options)
    if(typeof options.validate !== 'function') throw new Error('options.validate must be a function')
    const scheme = {
        authenticate: async function (request, h) {
            const { isValid, credentials, response } = await settings.validate(request, request.headers, h);
            if (response !== undefined) {
                return h.response(response).takeover();
            }
            if (!isValid) {
                return h.unauthenticated(Boom.unauthorized('Bad credentials', name), credentials ? { credentials } : null);
            }
            if (!credentials ||
                typeof credentials !== 'object') {
                throw Boom.badImplementation('Bad credentials object');
            }

            return h.authenticated({ credentials });
        }
    }
    return scheme;
}
const register = async function (server, options) {
    server.auth.scheme('my-auth', myMethod);
}

module.exports = {
    name: name,
    version: version,
    register: register,
    once: true,
};