var Lighter = require('nodejs-lighter');
var config = require('./config.json');

var lighter = new Lighter(config);
var logger = lighter.logger;
var middlewares = lighter.middlewares;

lighter.use(middlewares.contextCreator());
lighter.use(middlewares.logger(logger));

lighter.get('/service-status', function (req, res) {
    req.context.logger.info('getting /status');
    res.send(200, 'ok');
});

lighter.use('/v1/services', require('./routers/service'));

lighter.use(middlewares.responder);

// set up socket.io
var io = require('socket.io')(lighter.server);
require('./managers/broadcast-manager').bindSocketIO(io, logger);

lighter.run();
