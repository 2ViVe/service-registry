var ConfigurationManager = require('../managers/service-manager');
var router = require('nodejs-lighter').Router();

router.get('/:serviceName', function (req, res, next) {
    var context = req.context,
        serviceName = req.params.serviceName;

    ConfigurationManager.getServicesByNameAsync(context, serviceName).then(function (services) {
            next({body: services});
        }).catch(function (error) {
            next(error);
        });
});

module.exports = router;