var Socket = require('./managers/Socket'),
    WebServer = require('./managers/WebServer'),
    extend = require('extend');

var settings = {
    socket: {
        port: 3000
    },
    web: {
        port: 8000
    }
};

module.exports = {};

module.exports.settings = function(userSettings) {
    if (userSettings) {
        return extend(settings, userSettings);
    }
    return settings;
};

var startSocket = function() {
    Socket.port = settings.socket.port;
    Socket.scope = module.exports;
    return module.exports.currentSocket = Socket.start();
};

var initApplications = function() {
    return module.exports.applications = {
        fileManager: require('./applications/FileManager')(module.exports.currentWebServer, module.exports.currentSocket)
    };
};

module.exports.startWebServer = function() {
    startSocket();
    WebServer.port = settings.web.port;
    WebServer.scope = this;
    module.exports.currentWebServer = WebServer.start();
    initApplications();
    return module.exports.currentWebServer;
};
