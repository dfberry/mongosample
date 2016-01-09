var testname = "native-insert2";
console.time(testname);
var MongoClient = require('mongodb').MongoClient,  
  fs = require('fs');
//var parser = require('JSONStream').parse('*');

// parse json data into stream 

var ca = [fs.readFileSync(__dirname + '/composeio.pem')];

console.log (ca);
var data = fs.readFileSync(__dirname + '/MOCK_DATA.json', 'utf8');
var json = JSON.parse(data);
//var data = {"id":1,"gender":"Female","first_name":"Louise","last_name":"Jones","email":"ljones0@baidu.com","ip_address":"106.23.250.164"};
var collectionName  = testname;
var connectionstring = 'mongodb://dbtest:dbtest@aws-us-east-1-portal.2.dblayer.com:10907,aws-us-east-1-portal.3.dblayer.com:10962/mytestdb?ssl=true'; 

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
    
    db.collection(testname).insert(json, function (err, collection) {
        if (err) console.log((err));
        db.close();
        console.timeEnd(testname);
    }); // collection.insert   
});