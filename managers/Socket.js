var socketio = require('socket.io'),
    dotProp = require('dot-prop');

/**
* Constructs a Socket.
* Socket manager powered by Socket.IO.
*
* @constructor
*/
function Socket(){
    this.port = null;
    this.io = null;
    this.scope = {};
}

Socket.prototype.start = function () {
    var self = this;
    var settings = self.scope.settings();

    self.io = socketio(settings.socket.port);

    self.io.on('connection', function (socket) {
        socket.emit('structure', {key: self.scope.key, title: self.scope.title, sub: self.scope.sub});
        socket.on('call', function(data){
            dotProp.get(self.scope, data.path).job.call(data);
        });
    });

    return self;
};

module.exports = new Socket();
