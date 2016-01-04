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

module.exports.startWebServer = function() {
    startSocket();
    WebServer.port = settings.web.port;
    WebServer.scope = this;
    return this.currentWebServer = WebServer.start();
};
