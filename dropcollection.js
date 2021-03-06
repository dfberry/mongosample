var MongoClient = require('mongodb').MongoClient,  
  fs = require('fs'),
  path = require('path');
  
var privateconfig = require(path.join(__dirname + '/server/config.json'));
 console.log(privateconfig);

var ca = [fs.readFileSync(path.join(__dirname + '/server/' + privateconfig.mongodb.certificatefile))];

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
        
        db.collection(privateconfig.mongodb.collection,function(err, collection){
            collection.drop(function(status){
                console.log(status);
                db.close();
                console.log('finished');
            });
        });
    }
        
});