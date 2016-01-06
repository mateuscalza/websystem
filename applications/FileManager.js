var jetpack = require('fs-jetpack');

module.exports = function(webServer, socket){
    webServer.server
    .get('/file-manager/items', function(req, res, next) {
        res.json(jetpack.list(req.query.path, true));
    });

    socket.io
    .of('/file-manager')
    .on('connection', function (socket) {
        socket.emit('a message', {
            that: 'only'
            , '/chat': 'will get'
        });
        chat.emit('a message', {
            everyone: 'in'
            , '/chat': 'will get'
        });
    });
}
