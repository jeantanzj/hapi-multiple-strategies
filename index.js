const Hapi = require('hapi');
const Boom = require('boom');
const validation = require('./validation')
const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

const init = async () => {

    await server.start()
    await server.register({
        plugin: require('./my-auth-plugin'),
        options: {}
    })
    await server.register({
        plugin: require('./combined-auth-plugin'),
        options: {}
    })

    server.route({
        method: 'GET',
        path: '/',
        options: {
            auth: false
        },
        handler: (request, h) => {
            return 'This path does not require authentication. ';
        },
    });

    /*START  option.auth.strategies does not work if you use the same scheme. See https://github.com/hapijs/hapi/issues/3444 */
    
    server.auth.strategy('xrw-strategy', 'my-auth', { validate: validation.checkXRequestedWith });
    server.auth.strategy('t-strategy', 'my-auth', { validate: validation.checkTrue });
    server.auth.strategy('f-strategy', 'my-auth', { validate: validation.checkFalse });
    server.route({
        method: 'GET',
        path: '/1',
        options: {
            auth: {
                strategies: ['xrw-strategy']
            }
        },
        handler: (request, h) => {
            return 'This path is authenticated using xrw-strategy -- we expect unauthorized if we dont supply header X-Requested-With === XmlHttpRequest   ';
        },
    });
    server.route({
        method: 'GET',
        path: '/2',
        options: {
            auth: {
                strategies: ['t-strategy']
            }
        },
        handler: (request, h) => {
            return 'This path is authenticated using t-strategy -- we expect authorized regardless of parameters ';
        },
    });
    server.route({
        method: 'GET',
        path: '/3',
        options: {
            auth: {
                strategies: ['f-strategy']
            }
        },
        handler: (request, h) => {
            return 'This path is authenticated using f-strategy -- we expect unauthorized regardless of parameters ';
        },
    });
    server.route({
        method: 'GET',
        path: '/4',
        options: {
            auth: {
                strategies: ['f-strategy', 't-strategy']
            }
        },
        handler: (request, h) => {
            return 'This path is authenticated using f-strategy, t-strategy \
             -- we expect unauthorized, because we cant use the same scheme for multiple strategies. \
             It will only authenticate using the first one -- f-strategy returns false.\
            If f-strategy and t-strategy used different schemes, then they would be tried in order until one succeeeds or all fail.';
        },
    });
    server.route({
        method: 'GET',
        path: '/5',
        options: {
            auth: {
                strategies: ['xrw-strategy', 't-strategy']
            }
        },
        handler: (request, h) => {
            return 'This path is authenticated using xrw-strategy, t-strategy \
             -- we expect unauthorized if we dont supply header X-Requested-With === XmlHttpRequest, even though t-strategy returns true. \
             It will only authenticate using the first one. \
            If xrw-strategy and t-strategy used different schemes, then they would be tried in order until one succeeeds or all fail.';
        },
    });
    /*END  option.auth.strategies does not work if you use the same scheme. See https://github.com/hapijs/hapi/issues/3444 */
    

    /*START  How to implement multiple strategies for testing the same scheme. */
    server.auth.strategy('xrw-f', 'combined-auth', {validate: [validation.checkXRequestedWith, validation.checkFalse]});
    server.auth.strategy('xrw-t', 'combined-auth', {validate: [validation.checkXRequestedWith, validation.checkTrue]});
    server.route({
        method: 'GET',
        path: '/6',
        options: {
            auth: {
                strategies: ['xrw-f']
            }
        },
        handler: (request, h) => {
            return 'This path is authenticated using xrw-f which tries the validation functions in order -- we expect authorized if we supply header X-Requested-With === XmlHttpRequest ';
        },
    });
    server.route({
        method: 'GET',
        path: '/7',
        options: {
            auth: {
                strategies: ['xrw-t']
            }
        },
        handler: (request, h) => {
            return 'This path is authenticated using xrw-t which tries the validation functions in order -- we expect authorized regardless of parameters ';
        },
    });

    /*END  How to implement multiple strategies for testing the same scheme. */

    return server
};

init()
.then((server)=>{
    console.log(`Server running at: ${server.info.uri}`);
}).catch((err)=>{
    console.error(err)
    process.exit(1)
})
