var database = require('./database');
var fs = require('fs');
var http = require('http');
var URL = require('url');

var server = http.createServer(function(req, res) {
	res.writeHead(200, {'Content-type' : 'application/json'});
	
	// determine what the incoming URL request is
	var parsedUrl = URL.parse(req.url, true);
	console.log(parsedUrl);
	switch(parsedUrl.pathname) {
		case '/tienda/register':
			if(req.method == 'POST') {
				var body = "";
				// get the passed data during POST during req 'on data' event
				req.on('data', function(dataChunk) {
					body += dataChunk;
				});
				
				req.on('end', function() {
					// Once data is completed from POST body turn it into JSON to proceed with saving to DB
					var postJSON = JSON.parse(body);
					console.log(postJSON);
					
				});
			}
		break;
		default:
		res.end('That service is not available');
	}
});

server.listen(9090);
console.log('Tienda API service is running on port 9090');