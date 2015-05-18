require('./const');
var Lighter = require('nodejs-lighter');
var config = require('./config.json');
var bodyParser = require('body-parser');


var lighter = new Lighter(config);
var logger = lighter.logger;
var middlewares = lighter.middlewares;
var handlers = require('./handlers');

lighter.use(middlewares.contextCreator());
lighter.use(middlewares.logger(logger));
lighter.use(bodyParser.json());
require('./routers')(lighter, middlewares, handlers);

lighter.get('/service-status', function (req, res) {
    req.context.logger.info('getting /status');
    res.send(200, 'ok');
});

lighter.use(middlewares.responder);

// set up socket.io
var io = require('socket.io')(lighter.server);
require('./managers/broadcast-manager').bindSocketIO(io, logger);

lighter.run();
