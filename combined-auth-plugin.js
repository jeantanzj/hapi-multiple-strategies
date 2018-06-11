const validation = require('./validation')
const Boom = require('boom')
const name = 'combined-auth-plugin'
const version = '1.0.0'

const doAuthenticate = async function(request, headers, validate){
    let x = {isValid: false, credentials: null}
    for(let strategy of validate){
        x = await strategy(request,headers)
        if(x.isValid) break
    }
    return x
}
const myMethod = function (server, options) {
    const settings = Object.assign({}, options)
    if( !( settings.validate instanceof Array) || ! settings.validate.reduce((a,b)=> a && typeof b === 'function', true) ) throw new Error('options.validate must be an array of functions')
    const scheme = {
        authenticate: async function (request, h) {
            const headers = request.headers;
            const { isValid, credentials, response } = await doAuthenticate(request, headers, settings.validate);
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
    server.auth.scheme('combined-auth', myMethod);
}

module.exports = {
    name: name,
    version: version,
    register: register,
    once: true,
};