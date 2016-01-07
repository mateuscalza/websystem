var jetpack = require('fs-jetpack');
var path = require('path');
var mime = require('mime');
var fs = require('fs');

module.exports = function(webServer, socket){
    webServer.server
    .get('/file-manager/items', function(req, res, next) {
        res.json(jetpack.list(req.query.path, true));
    }).get('/download', function(req, res){

        var filename = path.basename(req.query.file);
        var mimetype = mime.lookup(req.query.file);

        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', mimetype);

        var filestream = fs.createReadStream(req.query.file);
        filestream.pipe(res);
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
