var database = require('./database');
var fs = require('fs');
var http = require('http');
var URL = require('url');

const express = require('express');
const api = express();
const port = 9090;
const TiendaDB = 'tienda';
const bodyParser = require('body-parser');

api.use(bodyParser.json());
api.use(bodyParser.urlencoded({extended : true}));


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
	//console.log('user_email: ' + resourceObj.user_email);
	database.find(TiendaDB, tableName, {'user_email' : resourceObj.user_email, 'user_password' : resourceObj.user_password}, function(err, resource) {
		//res.writeHead(200, {'Content-type':'application/json'});
		//res.end(JSON.stringify(resource));
		var resourceStr = JSON.stringify(resource);
		console.log("resourceStr: " + resourceStr);
		return resourceStr;
	})
}

var updateResource = function(tableName, id, resourceObj, req, res) {
	console.log("Updating db document object");
	database.updateOne(TiendaDB, tableName, id, resourceObj, function(err, result) {
		res.writeHead(200, {'Content-type' : 'application/json'});
		res.end(JSON.stringify(result));
	})
}

var registerUser = function(registerJSONobj, req, res) {
	insertResource('tienda_users', registerJSONobj, req, res);
}

var login = function(loginObj, req, res) {
	return findResource('tienda_users', loginObj, req, res);
}

var updateProfile = function(profileJsonObj, req, res) {
	var updateObj = '{}';	// create a new JSON obj

	if (profileJsonObj.user_showname) {
	  console.log('updating user_showname: ' + profileJsonObj.user_showname);
	  updateObj.user_showname = profileJsonObj.user_showname;
	}

	if(profileJsonObj.user_email) {
		console.log('updating user_email: ' + profileJsonObj.user_email);
		updateObj.user_email = profileJsonObj.user_email;
	}

	if(profileJsonObj.user_telecom) {
		console.log('updating user_telecom: ' + profileJsonObj.user_telecom);
		updateObj.user_telecom = profileJsonObj.user_telecom;
	}

	if(profileJsonObj.user_password) {
		console.log('updating user_password: ' + profileJsonObj.user_password);
		updateObj.user_password = profileJsonObj.user_password;
	}
	//{"user_showname":document.user_showname, "user_email" : document.user_email, "user_telecom" : document.user_telecom, "user_password" : document.user_password}
	console.log('updateObj : ' + updateObj)
	updateResource('tienda_users', profileJsonObj._id, updateObj, req, res);
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
	//console.log("req.body.user_email: " + req.body.user_email);
	//console.log("req.body.user_password: " + req.body.user_password);
	//console.log(req.headers);
	var loginBody = {};
	loginBody.user_email = req.body.user_email;
	loginBody.user_password = req.body.user_password;

	//console.log("loginBody: " + loginBody);
	//req.on('data', function(dataChunk) {
	//	loginBody += dataChunk;
	//});
	//console.log('loginBody: ' + loginBody);
	//req.on('end', function() {
	//	var postJSON = JSON.parse(loginBody);
	//	console.log('postJSON: ' + postJSON);

		if(req.body.user_email && req.body.user_password) {
	//		login(postJSON, req, res);
				var responseJson = login(loginBody, req, res);
				console.log("responseJson: " + responseJson);
				//if(responseJson._id) {
				//	res.writeHead(200, {'Content-type':'application/json'});
					//res.end(JSON.stringify(resource));
					res.redirect('/index.html');
				//}
		}
	//});
});



api.post('/tienda/profile/update', function(req, res) {
		var updateProfileBody = "";
		req.on('data', function(dataChunk) {
			updateProfileBody += dataChunk;
		});

		req.on('end', function() {
			var profileBodyJson = JSON.parse(updateProfileBody);
			console.log("_id: " + profileBodyJson._id);
			console.log(profileBodyJson);
			if(profileBodyJson._id) {
				updateProfile(profileBodyJson, req, res);
			}

		})
});

api.get('/ping', function(req, res) {
	res.send("Tienda service ping success!");
});

api.listen(port, function() {
	console.log('Tienda Service listening to port ' + port);
});

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
