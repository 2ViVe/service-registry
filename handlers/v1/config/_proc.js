var jf = require('jsonfile');
var async = require('async');
var u = require('underscore');

var getPostData = function (req) {
    return {
        "name": req.body["name"],
        "host": req.body["host"],
        "port": parseInt(req.body["port"], 10),
        "api-uri": req.body["api-uri"],
        "status-uri": req.body["status-uri"]
    };
};

var validatePostData = function (data, callback) {
    var error;

    if(!data["name"]){
        error = new Error('service name is invalid.');
        error.statusCode = 400;
        callback(error);
        return;
    }

    if(!data["host"] || !(/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){3}$/.test(data["host"]))){
        error = new Error('service host is invalid.');
        error.statusCode = 400;
        callback(error);
        return;
    }

    if(!data["port"] || (data["port"] <=0 || data["port"] > 65535)){
        error = new Error('service port is invalid.');
        error.statusCode = 400;
        callback(error);
        return;
    }

    if(!data["api-uri"] || !/^\/[a-z0-9_\-\/]*[a-z0-9]$/i.test(data["api-uri"])){
        error = new Error('api-uri port is invalid.');
        error.statusCode = 400;
        callback(error);
        return;
    }

    if(!data["status-uri"] || !/^\/[a-z0-9_\-\/]*[a-z0-9]$/i.test(data["status-uri"])){
        error = new Error('status-uri port is invalid.');
        error.statusCode = 400;
        callback(error);
        return;
    }
    callback(null);
};

var isExistByName = function (serviceName, configObj, callback) {
    var service;
    service = u.find(configObj.services, function (service){
        return service.name.toLowerCase() === serviceName;
    });

    if(service){
        callback(null ,true);
    }
    else{
        callback(null, false);
    }
};

var getServiceByName = function (serviceName, configObj, callback) {
    var service;
    service = u.find(configObj.services, function (service){
        return service.name.toLowerCase() === serviceName;
    });

    callback(null, service);
};

var getConfigObj = function (callback) {
    jf.readFile(SERVICE.SERVICE_CONFIG_FILE_PATH, function(error, configObj) {
        if(error){
            callback(error);
            return;
        }
        callback(null, configObj);
    });
};

var updateConfigFile = function (servicesObj, callback) {
    jf.spaces = 2;
    jf.writeFile(SERVICE.SERVICE_CONFIG_FILE_PATH, servicesObj, function(error) {
        if(error){
            callback(error);
            return;
        }
        callback(null);
    });
};

var updateOldService = function (oldService, newService) {
    u.extend(oldService, newService);
};

var filterServices = function (configObj, serviceName) {
    return u.filter(configObj.services, function (service) {
        return service.name !== serviceName;
    });
};

var post = function (req, res, next) {
    var postData,
        servicesObj,
        error;
    async.waterfall([
        function (callback) {
            postData = getPostData(req);
            validatePostData(postData, callback);
        },

        function (callback) {
            getConfigObj(callback);
        },

        function (configObj, callback) {
            servicesObj = configObj;
            isExistByName(postData["name"], servicesObj, callback);
        },

        function (isExist, callback) {
            if(isExist === true){
                error = new Error("duplicate service name.");
                error.statusCode = 400;
                next(error);
                return;
            }
            callback(null);
        },

        function (callback) {
            servicesObj.services.push(postData);
            updateConfigFile(servicesObj, callback);
        }
    ], function (error){
        if(error){
            next(error);
            return;
        }

        next({
            body: {success: true}
        });
    });
};

var update = function (req, res, next) {
    var postData,
        service,
        servicesObj,
        error;

    async.waterfall([
        function (callback){
            postData = getPostData(req);
            validatePostData(postData, callback);
        },

        function (callback){
            getConfigObj(callback);
        },

        function (configObj, callback) {
            servicesObj = configObj;
            getServiceByName(postData["name"], servicesObj, callback);
        },

        function (service, callback) {
            if(!service) {
                error = new Error("the service is not exist.");
                error.statusCode = 400;
                callback(error);
                return;
            }
            callback(null, service);
        },

        function (service, callback) {
            updateOldService(service, postData);
            callback(null);
        },

        function(callback) {
            updateConfigFile(servicesObj, callback);
        }
    ], function(error){
        if(error){
            next(error);
            return;
        }

        next({
            body: {success: true}
        });
    });

};

var del = function (req, res, next) {
    var servicesObj,
        error,
        serviceName;
    
    async.waterfall([

        function (callback) {
            if(!req.query.name) {
                error = new Error("need a service name.");
                error.statusCode = 400;
                callback(error);
                return;
            }
            serviceName = req.query.name;
            callback(null);
        },

        function (callback) {
            getConfigObj(callback);
        },

        function (allServices, callback) {
            servicesObj = allServices;
            services = filterServices(servicesObj, serviceName);
            updateConfigFile({services: services}, callback);
        }

    ], function(error, result){
        if(error){
            next(error);
            return;
        }

        next({
            body: {success: true}
        });
    });
};


module.exports = {
    post: post,
    put: update,
    del: del
};