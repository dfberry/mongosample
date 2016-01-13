var MongoClient = require('mongodb').MongoClient,  
  fs = require('fs');

var collectionName  = 'mockdata';
var connectionstring = 'mongodb://dbtest:dbtest@aws-us-east-1-portal.2.dblayer.com:10907,aws-us-east-1-portal.3.dblayer.com:10962/mytestdb?ssl=true'; 

var ca = [fs.readFileSync(__dirname + '/server/clientcertificate.pem')];

MongoClient.connect(connectionstring, {
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
        
    db.collection(collectionName).find().each(function(err, doc) {       
        if (doc){
            
            console.log(doc.latitude + "," + doc.longitude);
            
            var numericLat = parseFloat(doc.latitude);
            var numericLon = parseFloat(doc.longitude);
            
            doc.latitude = numericLat;
            doc.longitude = numericLon;
            doc.geojson= { location: { type: 'Point', coordinates : [numericLat, numericLon]}}; // convert field to string
            db.collection(collectionName).save(doc);
            
        } else {
            db.close();
        }

    });
    console.log('finished');

});

