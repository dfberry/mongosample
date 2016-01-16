var MongoClient = require('mongodb').MongoClient,  
  fs = require('fs'),
  path = require('path');

var privateconfig = require(path.join(__dirname + '/config.json'));
console.log(privateconfig);
var ca = [fs.readFileSync(path.join(__dirname + privateconfig.mongodb.certificatefile))];

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
    if (err) console.log(err);
    if (db) console.log("connected");
       
    db.collection(privateconfig.mongodb.collection).find().each(function(err, doc) {       
        if (doc){
            
            console.log(doc.latitude + "," + doc.longitude);
            
            var numericLat = parseFloat(doc.latitude);
            var numericLon = parseFloat(doc.longitude);
            
            doc.latitude = numericLat;
            doc.longitude = numericLon;
            doc.geojson= { location: { type: 'Point', coordinates : [numericLat, numericLon]}}; // convert field to string
            db.collection(privateconfig.mongodb.collection).save(doc);
            
        } else {
            db.close();
        }
    });
    console.log('finished');
});