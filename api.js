var database = require('./database');
var fs = require('fs');
var http = require('http');

var server = http.createServer(function(req, res) {
	res.writeHead(200);
	res.end('API server is running');
});

server.listen(9090);
console.log('Tienda API service is running on port 9090');