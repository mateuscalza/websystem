var express = require('express'),
    fs = require('fs');

/**
* Constructs a WebServer.
* WebServer manager powered by Express.
*
* @constructor
*/
function WebServer() {
    this.port = null;
    this.server = null;
    this.scope = {};
}

WebServer.prototype.start = function() {
    // Get settings from main scope
    var settings = this.scope.settings();

    // Create express server
    this.server = express();

    // Set the web (public) folder
    this.server.use(express.static(__dirname + '/../web'));

    // Index
    this.server.get('/', function(req, res) {
        console.log('hum');
        fs.readFile(__dirname + '/../web/index.html', 'utf8', function(err, text) {
            console.log(text);
            if (err) {
                console.error(err);
            }
            res.send(text);
        });
    });

    // Get settings
    this.server.get('/settings.json', function(req, res) {
        res.send(settings);
    });

    // Load extra directives from app
    this.server.get('/directives.js', function(req, res) {
        if(settings.web.extraDirectives){
            fs.readFile(settings.web.extraDirectives, 'utf8', function(err, text) {
                if (err) {
                    console.error(err);
                }
                res.send(text);
            });
        } else {
            res.send('');
        }
    });

    // Start server
    this.server.listen(settings.web.port);
    console.log('WebSystem started on port ' + settings.web.port);

    return this;
};

module.exports = new WebServer();
