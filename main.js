/**
 * Main server file for NodeJS.
 * Starts the NodeJS server and registers endpoints, etc.
 */

var config = require('./config');

// Here we set up a static web server
if (config.ENABLE_HTTP_SERVER) {
    var express = require('express');
    var app = express();
    
    app.use(express.static('./build/static'));

    app.listen(config.HTTP_PORT, function() {
        console.log('Listening on *:' + config.HTTP_PORT);
    });
}

if (config.ENABLE_SOCKET_SERVER) {
    var io = require('socket.io').listen(config.SOCKET_PORT);
    // TODO finish this
}

