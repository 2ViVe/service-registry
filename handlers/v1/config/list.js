var ConfigurationManager = require('../../../managers/service-manager');

function list(request, response, next) {
    ConfigurationManager.getServicesAsync(SERVICE.SERVICE_CONFIG_FILE_PATH).then(function (services) {
        next({body: services});
    });
}

module.exports = list;