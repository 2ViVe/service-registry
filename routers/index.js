/**
 * regist all then routers
 *
 * This module loads all files that has a .js suffix
 * and run the export method.
 */

/*jslint regexp: true, nomen: true */

var fs = require('fs');

/**
 * Scan the directory and regist all the routers 
 *
 * @method registRouter
 * @param lighter {Object}
 * @param middleware {Object}
 * @param handler {Object} 
 */
function registRouter(lighter, middleware, handler) {
    var directory = __dirname;
    fs.readdirSync(directory).forEach(function (filename) {
        var fullPath,
            stat,
            match;

        // Skip index.js and files started with '.'
        if (filename === 'index.js' || /^\./.test(filename)) {
            return;
        }

        fullPath = directory + '/' +  filename;
        stat = fs.statSync(fullPath);

        if (!stat.isDirectory()) {
            match = /(\w+)\.js$/.exec(filename);

            if (match) {
                return require(fullPath)(lighter, middleware, handler);
            }
        }
    });

    return exports;
}

module.exports = registRouter;
