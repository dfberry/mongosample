var MongoClient = require('mongodb').MongoClient,  
  fs = require('fs');

var collectionName  = 'mockdata';
var connectionstring = 'mongodb://dbtest:dbtest@aws-us-east-1-portal.2.dblayer.com:10907,aws-us-east-1-portal.3.dblayer.com:10962/mytestdb?ssl=true'; 

var ca = [fs.readFileSync(__dirname + '/server/clientcertificate.pem')];
var data = fs.readFileSync(__dirname + '/data/mockdata.json', 'utf8');
var json = JSON.parse(data);

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
    if (err) {
        console.log(err);
    } else {
        console.log("connected");
        db.collection(collectionName).insert(json, function (err, collection) {
            if (err) console.log((err));
            db.close();
            console.log('finished');
        }); 
    }  
});