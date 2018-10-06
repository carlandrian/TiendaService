var database = require('./database');
var fs = require('fs');
var http = require('http');
var URL = require('url');

var insertResource = function(tableName, resourceObj, req, res) {
	database.insert('tienda', tableName, resourceObj, function(err, resource) {
		res.writeHead(200, {'Content-type' : 'application/json'});
		if(err) {
			res.end(JSON.stringify(err));
		}
		res.end(JSON.stringify(resource));
	})
}

var registerUser = function(registerJSONobj, req, res) {
	insertResource('tienda_users', registerJSONobj, req, res);
}

var getTimeStamp = function() {
	var date = new Date();
	
	var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return month + "/" + day + "/" + year + " " + hour + ":" + min + ":" + sec; // return in format mm/dd/yyyy HH:MM:SS
}

var server = http.createServer(function(req, res) {
	res.writeHead(200, {'Content-type' : 'application/json'});
	
	// determine what the incoming URL request is
	var parsedUrl = URL.parse(req.url, true);
	console.log(parsedUrl);
	switch(parsedUrl.pathname) {
		case '/tienda/register' || '/tienda/register/':
			if(req.method == 'POST') {
				console.log('processing register from POST');
				var body = "";
				// get the passed data during POST during req 'on data' event
				req.on('data', function(dataChunk) {
					body += dataChunk;
				});
				console.log('POST body: ' + body);
				
				req.on('end', function() {
					// Once data is completed from POST body turn it into JSON to proceed with saving to DB
					var postJSON = JSON.parse(body);
					console.log(postJSON);
					
					// check if all mandatory fields are passed
					if(postJSON.user_showname
						&& postJSON.user_email
						&& postJSON.user_telecom
						&& postJSON.user_password) {
						postJSON.user_register_date = getTimeStamp();
						registerUser(postJSON, req, res);
					} else {
						res.end("Registration failed!");
					}
				});
			}
		break;
		default:
		res.end('That service is not available');
	}
});

server.listen(9090);
console.log('Tienda API service is running on port 9090');