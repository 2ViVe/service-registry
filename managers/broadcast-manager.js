var io = null;
var logger = null;

exports.notifyServiceChanged = function (options) {
    var eventData = {
            serviceName: options.serviceName
        };
    logger.trace('emitting `serviceChanged` event to all clients. ', eventData);
    io.emit('serviceChanged', eventData);
};

exports.bindSocketIO = function (socketIO, argLogger) {
    io = socketIO;
    logger = argLogger;

    io.on('connection', function () {
        logger.trace('client connected to server.');
    });
};