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

var findResource = function(tableName, resourceObj, callback) {
	//console.log('user_email: ' + resourceObj.user_email);
	database.find(TiendaDB, tableName, {'user_email' : resourceObj.user_email, 'user_password' : resourceObj.user_password}, callback);
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
	return findResource('tienda_users', loginObj, function(err, loginObj) {
		
		
		var resourceStr = JSON.stringify(loginObj);
		console.log("resourceStr: " + resourceStr);
		//return resourceStr;
		//res.redirect('/index');
		res.writeHead(200, {'Content-type':'application/json'});
		res.end(JSON.stringify(loginObj));
	});
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
	//var body = "";
	// get the passed data during POST during req 'on data' event
	//req.on('data', function(dataChunk) {
	//	body += dataChunk;
	//});
	console.log('register api called');
	var registerBody = {};
	registerBody.user_email = req.body.user_email;
	registerBody.user_showName = req.body.user_showName;
	registerBody.user_phoneNumber = req.body.user_phoneNumber;
	registerBody.user_password = req.body.user_password;
	console.log('registerBody: ' + JSON.stringify(registerBody));

	//req.on('end', function() {
		// Once data is completed from POST body turn it into JSON to proceed with saving to DB
		//var postJSON = JSON.parse(registerBody);
		//console.log(postJSON);

		// check if all mandatory fields are passed
		if(postJSON.user_showName
		&& postJSON.user_email
		&& postJSON.user_phoneNumber
		&& postJSON.user_password) {
			postJSON.user_register_date = getTimeStamp();
			registerUser(registerBody, req, res);
		} else {
			res.end("Registration failed!");
		}
	//});
});

api.post('/tienda/profile/login', function(req, res) {
	var loginBody = {};
	loginBody.user_email = req.body.user_email;
	loginBody.user_password = req.body.user_password;


	if(req.body.user_email && req.body.user_password) {
		login(loginBody, req, res);
		//console.log("responseJson: " + responseJson);
		
	}
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

api.get('/tienda/ping', function(req, res) {
	res.send("Tienda service ping success!");
});

api.listen(port, function() {
	console.log('Tienda Service listening to port ' + port);
});


api.post('tienda/item/sell', function(req, res) {
	var sellItem = {};
	sellItem.item_type = req.body.item_type;
	sellItem.item_category_type = req.body.item_category_type;
	sellItem.item_condition_type = req.body.item_condition_type;
	sell_item.item_title = req.body.item_title;
	sell_item.item_price = req.body.item_price;
	sell_item.item_description = req.body.item_description;
	sell_item.item_posted_date = req.body.item_posted_date;
	sell_item.item_eff_start_date = req.body.item_eff_start_date; // this can be the current date of sell item posting or the date of re-activation of an expired sell item.
	sell_item.item_eff_end_date = req.body.item_eff_end_date;	// a function can be created to generate the item_eff_end_end to calculate the number of days a sell item is to expire.
	sell_item.item_posted_by = req.body.item_posted_by;	// get the value of this from the current user of the app;
	
	
})

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
