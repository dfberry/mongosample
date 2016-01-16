var MongoClient = require('mongodb').MongoClient,  
  fs = require('fs'),
  path = require('path');

var privateconfig = require(path.join(__dirname + '/config.json'));
console.log(privateconfig);
var ca = [fs.readFileSync(path.join(__dirname + privateconfig.mongodb.certificatefile))];
var data = fs.readFileSync(path.join(__dirname + privateconfig.mongodb.data), 'utf8');
var json = JSON.parse(data);

MongoClient.connect(privateconfig.mongodb.url, {
    mongos: {
        ssl: true,
        sslValidate: true,
        ca: ca,
        sslCA: ca,
        poolSize: 1,
        reconnectTries: 1
    },
}, function (err, db) {
    if (err) {
        console.log(err);
    } else {
        console.log("connected");
        db.collection(privateconfig.mongodb.collection).insert(json, function (err, collection) {
            if (err) console.log((err));
            db.close();
            console.log('finished');
        }); 
    }  
});