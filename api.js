var database = require('./database');
var fs = require('fs');
var http = require('http');
var URL = require('url');

const express = require('express');
const api = express();
const port = 9090;
const TiendaDB = 'tienda';

var insertResource = function(tableName, resourceObj, req, res) {
	database.insert(TiendaDB, tableName, resourceObj, function(err, resource) {
		res.writeHead(200, {'Content-type' : 'application/json'});
		if(err) {
			res.end(JSON.stringify(err));
		}
		res.end(JSON.stringify(resource));
	})
}

var findResource = function(tableName, resourceObj, req, res) {
	console.log('user_email: ' + resourceObj.user_email);
	database.find(TiendaDB, tableName, {'user_email' : resourceObj.user_email}, function(err, resource) {
		res.writeHead(200, {'Content-type':'application/json'});
		res.end(JSON.stringify(resource));
	})
}

var updateResource = function(tableName, resourceObj, req, res) {
	console.log("Updating db document object");
	database.updateOne(TiendaDB, tableName, resourceObj, function(err, result) {
		res.writeHead(200, {'Content-type' : 'application/json'});
		res.end(JSON.stringify(result));
	})
}

var registerUser = function(registerJSONobj, req, res) {
	insertResource('tienda_users', registerJSONobj, req, res);
}

var login = function(loginObj, req, res) {
	findResource('tienda_users', loginObj, req, res);
}

var updateProfile = function(profileJsonObj, req, res) {
	updateResource('tienda_users', profileJsonObj, req, res);
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
};

var getDataFromReqBody = function(req, res) {
	var body = "";
	req.on('data', function(dataChunk) {
		body += dataChunk;
	});

	return body;
};

/**
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
		case '/tienda/profile/update' || '/tienda/profile/update/':
			if(req.method == 'POST') {
				var body = "";
				req.on('data', function(dataChunk) {
					body += dataChunk;
				});

				req.on('end', function() {

				})
			} else {

			}
		break;
		case '/tienda/login' || '/tienda/login/':
			if(req.method == 'POST') {
				var loginBody = "";
				req.on('data', function(dataChunk) {
					loginBody += dataChunk;
				});
				console.log('loginBody: ' + loginBody);
				req.on('end', function() {
					var postJSON = JSON.parse(loginBody);
					console.log('postJSON: ' + postJSON);

					if(postJSON.user_email && postJSON.user_password) {
						login(postJSON, req, res);

					}
				})
			}
		break;
		default:
		res.end('That service is not available');
	}
});

server.listen(9090);
console.log('Tienda API service is running on port 9090');
*/

api.get('/', function(req, res) {
	res.send('Welcome to Tienda Service');
});

api.post('/tienda/profile/register', function(req, res) {
	//console.log('processing register from POST');
	//var body = getDataFromReqBody(req, res);
	var body = "";
	// get the passed data during POST during req 'on data' event
	req.on('data', function(dataChunk) {
		body += dataChunk;
	});
	//console.log('POST body: ' + body);

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
});

api.post('/tienda/profile/login', function(req, res) {
	var loginBody = "";
	req.on('data', function(dataChunk) {
		loginBody += dataChunk;
	});
	//console.log('loginBody: ' + loginBody);
	req.on('end', function() {
		var postJSON = JSON.parse(loginBody);
		console.log('postJSON: ' + postJSON);

		if(postJSON.user_email && postJSON.user_password) {
			login(postJSON, req, res);

		}
	});
});



api.post('/tienda/profile/update', function(req, res) {
		var updateProfileBody = "";
		req.on('data', function(dataChunk) {
			updateProfileBody += dataChunk;
		});

		req.on('end', function() {
			var profileBodyJson = JSON.parse(updateProfile);
			console.log(profileBodyJson);
			updateProfile(profileBodyJson);
		})
});

api.get('/ping', function(req, res) {
	res.send("Tienda service ping success!");
});

api.listen(port, function() {
	console.log('Tienda Service listening to port ' + port);
});
