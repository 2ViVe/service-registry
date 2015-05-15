var path = require('path'),
    serviceConfigPath,
    configFilesDir;

serviceConfigPath = path.join(__dirname, "../config-files/services.json");
configFilesDir = path.join(__dirname, "../config-files");

global.SERVICE = {
    SERVICE_CONFIG_FILE_PATH: serviceConfigPath,
    CONFIG_FILES_DIR: configFilesDir
};