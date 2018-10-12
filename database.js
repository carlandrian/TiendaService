// Our primary interface for the MongoDB instance
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

// Used in order to verify correct return values
var assert = require('assert');

/**
*
* @param databaseName - name of the database we are connecting to.
* @param callback - callback to execute when connection finishes.
*/
var connect = function(databaseName, callback) {

  // URL to MongoDB instance we are connecting to
  var url = 'mongodb://localhost:27017/' + databaseName;

  // Connect to our MongoDB instance, retrieve the selected
  // database, and execute a callback on it.
  MongoClient.connect(url, function(error, client){
    // Make sure that no error was thrown
    assert.equal(null, error);
    console.log("Successfully connected to MongoDB instance!");
    callback(client);
  });
};

/**
* Executes the find() method of the target collection in the
* target database, optionally with a query.
* @param databaseName - name of the database
* @param collectionName - name of the collection
* @param query - optional query parameters for find()
*/
exports.find = function(databaseName, collectionName, query, callback) {
  connect(databaseName, function(client) {
    // The collection we want to find documents from
    //console.log('retrieving on ' + collectionName);
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    // Search the given collection in the given database for
    // all documents which match the criteria, convert them to
    // an array, and finally execute a callback on them.
    console.log('query = ' + JSON.stringify(query));
    collection.find(query).toArray(
      // Callback method
      function (err, documents){
        // Make sure nothing went wrong
        assert.equal(err, null);

        // Print all the documents that we found, if any
        console.log("MongoDB returned the following documents:");
        console.dir(documents);

        callback(err, documents);

        // Close the database connection to free resources
        client.close();
      }
    );
  });
};

exports.findOneById = function(databaseName, collectionName, id, callback) {
  connect(databaseName, function(client) {
    // The collection we want to find documents from
    //console.log('retrieving on ' + collectionName);
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);

    // Search the given collection in the given database for
    // all documents which match the criteria, convert them to
    // an array, and finally execute a callback on them.
    //console.log('query = ' + JSON.stringify(query));
    collection.find(mongodb.ObjectId(id)).toArray(
      // Callback method
      function (err, documents){
        // Make sure nothing went wrong
        assert.equal(err, null);

        // Print all the documents that we found, if any
        console.log("MongoDB returned the following documents:");
        console.dir(documents);

        callback(err, documents);

        // Close the database connection to free resources
        client.close();
      }
    );
  });
};

exports.insert = function(databaseName, collectionName, document, callback) {
  connect(databaseName, function(client) {
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);
    //var collection = database.collection(collectionName);
    collection.insert(document, {w : 1}, function (err, documents) {
      console.log("Added new documents");
      console.log("documents = " + JSON.stringify(documents));
      console.log("documents.ops[0]._id = " + documents.ops[0]._id);
      callback(err, documents.ops[0]._id);
    });
  });
};

exports.updateOne = function(databaseName, collectionName, document, callback) {
  connect(databaseName, function(client) {
    const db = client.db(databaseName);
    const collection = db.collection(collectionName);
    collection.updateOne({"_id": document._id}, {$set:
      {"user_showname":document.user_showname, "user_email" : document.user_email, "user_telecom" : document.user_telecom, "user_password" : document.user_password}},
      function(err, result){
        console.log("document updated with _id : " + document._id);
        callback(err, result);
      });
  });
}
