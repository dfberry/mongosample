
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var fs = require('fs');

var ca = [fs.readFileSync(__dirname + "/composeio.pem")];

var config = {
    "url": "mongodb://dbtest:dbtest@aws-us-east-1-portal.2.dblayer.com:10907,aws-us-east-1-portal.3.dblayer.com:10962/mytestdb?ssl=true",
    "collection": "latlong",
    "options": {
        mongos : {
            ssl: true,
            sslValidate: true,
            ca: ca,
            sslCA: ca,
            poolSize: 1,
            reconnectTries: 1
        }
    }
 };

var aggregate = function (db, collection, callback) {
    db.collection(collection).aggregate(
        [
           
            { $project: 
                {
                    State: "$admincode1"//,
                    //PostalCode: "$postalcode",
                    //Location: ["$latitude", "$longitude"]
                }
            },
            
            
            { $sample: { size: 10 } },
             { $sort: {'State': 1}}
        ]).toArray(function (err, result) {
            assert.equal(err, null);
            console.log(result);
            callback(result);
        });
};

MongoClient.connect(config.url,config.options, function (err, db) {
    assert.equal(null, err);
    aggregate(db, config.collection, function (err, result) {
        db.close();
    });
});