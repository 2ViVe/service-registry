var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var BroadcastManager = require('./broadcast-manager');

var servicesConfigLoaded = false;
var serviceListMapByName = {};

var configFilesDir = SERVICE.CONFIG_FILES_DIR;
fs.watch(configFilesDir, function (event, fileName) {
    var regJSON = /(\w+).json$/i,
        matchJSON = regJSON.exec(fileName),
        companyCode;

    if (!matchJSON) {
        return;
    }

    console.log('config files changed.');
    loadServicesConfigAsync(true);
});

function loadServicesFromFileAsync(configFileName) {
    return new Promise(function (resolve, reject) {
        try {
            var config = JSON.parse(fs.readFileSync(configFileName));
            resolve(config.services);
        } catch (ex) {
            reject(ex);
        }
    });
}

function serviceConfigEquals(service1, service2) {
    return service1.name === service2.name &&
            service1.host === service2.host &&
            service1.port === service2.port &&
            service1['api-uri'] === service2['api-uri'] &&
            service1['status-uri'] === service2['status-uri'];
}

function servicesConfigEquals(services1, services2) {
    if (services1.length !== services2.length) {
        return false;
    }

    var i;
    for (i = 0; i < services1.length; i += 1) {
        if (!serviceConfigEquals(services1[i], services2[i])) {
            return false;
        }
    }
    return true;
}

function loadServicesConfigAsync(forceReload) {
    var newServiceListMapByName = {},
        serviceNames = [],
        changedServiceNames = [];

    return new Promise(function (resolve, reject) {
        if (servicesConfigLoaded && !forceReload) {
            resolve();
            return;
        }

        var configFile = SERVICE.SERVICE_CONFIG_FILE_PATH;
        loadServicesFromFileAsync(configFile).then(function (services) {
            if (!services || !services.length) {
                return;
            }

            services.forEach(function (service) {
                var serviceName = service.name,
                    servicesWithSameName = newServiceListMapByName[serviceName];
                if (!servicesWithSameName) {
                    newServiceListMapByName[serviceName] = servicesWithSameName = [];
                }

                servicesWithSameName.push(service);
                if (serviceNames.indexOf(serviceName) === -1) {
                    serviceNames.push(serviceName);
                }
            });

            Object.keys(serviceListMapByName).forEach(function (serviceName) {
                if (serviceNames.indexOf(serviceName) === -1) {
                    serviceNames.push(serviceName);
                }
            });

            serviceNames.forEach(function (serviceName) {
                var changed = !servicesConfigEquals(
                        serviceListMapByName[serviceName] || [],
                        newServiceListMapByName[serviceName] || []
                    );
                if (changed) {
                    changedServiceNames.push(serviceName);
                }
            });

            serviceListMapByName = newServiceListMapByName;
        }).then(function () {
            if (!servicesConfigLoaded) {
                return;
            }

            changedServiceNames.forEach(function (serviceName) {
                BroadcastManager.notifyServiceChanged({
                    serviceName: serviceName
                });
            });
        }).then(function () {
            servicesConfigLoaded = true;
            resolve();
        }).catch(function (err) {
            reject(err);
        });
    });
}

exports.getServicesByNameAsync = function (context, serviceName) {
    var logger = context.logger;

    return new Promise(function (resolve, reject) {
        loadServicesConfigAsync().then(function () {
            var servicesWithSameName = serviceListMapByName[serviceName] || [];
            resolve(servicesWithSameName);
        });
    });
};

exports.getServicesAsync = loadServicesFromFileAsync;

exports.loadServicesConfigAsync = loadServicesConfigAsync;
