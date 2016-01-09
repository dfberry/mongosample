var MongoClient = require('mongodb').MongoClient,  
  fs = require('fs');

var ca = [fs.readFileSync(__dirname + '/composeio.pem')];


var collectionName  = 'latlong';
var connectionstring = 'mongodb://dbtest:dbtest@aws-us-east-1-portal.2.dblayer.com:10907,aws-us-east-1-portal.3.dblayer.com:10962/mytestdb?ssl=true'; 

var updateAll = function(db, callback) {
    var i=0;
    db.collection(collectionName).find().each(function(err, doc) {
    
        doc.coordinates= [doc.latitude, doc.longitude]; // convert field to string
        db.collection(collectionName).save(doc);
        console.log("doc " + i++);
    });
};

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
    
    updateAll(db, function() {
      db.close();
  });
});
/*
db.foo.find( { 'bad' : { $type : 1 } } ).forEach( function (x) {   
  x.bad = new String(x.bad); // convert field to string
  db.foo.save(x);
});
*/