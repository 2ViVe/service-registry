var ConfigurationManager = require('../managers/service-manager');

function registRouters(lighter, middleware, handler) {

    lighter.get('/v1/services/:serviceName', function (req, res, next) {
        var context = req.context,
            serviceName = req.params.serviceName;

        ConfigurationManager.getServicesByNameAsync(context, serviceName).then(function (services) {
                next({body: services});
            }).catch(function (error) {
                next(error);
            });
    });
}

module.exports = registRouters;