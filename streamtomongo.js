var testname = "stream-insert4";
console.time(testname);
var fs = require('fs');

// parse json data into stream 
var parser = require('JSONStream').parse('*');

// get certificate

var ca = [fs.readFileSync(__dirname + '/composeio.pem')];

console.log (ca);

console.log("certificate found");

// setup config object for ssl connection composeio
var config = { 
    db: 'mongodb://dbtest:dbtest@aws-us-east-1-portal.2.dblayer.com:10907,aws-us-east-1-portal.3.dblayer.com:10962/mytestdb?ssl=true',
    collection: testname,
    dboptions: {
        mongos: {
            ssl: true,
            sslValidate: true,
            ca: ca,
            sslCA: ca,
            poolSize: 1,
            reconnectTries: 1
        }
    }    
 };
 
 console.log("config object");
 
var streamToMongo = require('./stream-to-mongo-ssl.js')(config);

console.log("stream object");


var dataChunk = 1;

fs.createReadStream('./MOCK_DATA.json')
.pipe(parser)
.pipe(streamToMongo)
    .on('data', function(data){
        console.log("chunk " + dataChunk);
    })
      .on('error', function(err){
          console.log('error happeened ' + err);
      })
      .on('finish', function(obj){
          console.log('finished ' + obj);
          console.timeEnd(testname);
      });
      