// native library
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');

// client certificate
// generated from database overview page under "SSL Public key"
var ca = [fs.readFileSync(__dirname + "/clientcertificate.pem")];

var mongourl = "mongodb://dbtest:dbtest@aws-us-east-1-portal.2.dblayer.com:10907,aws-us-east-1-portal.3.dblayer.com:10962/mytestdb?ssl=true";

var collectionName = "mockdata";

// Set DEFAULT Random Sampling values
var randomsample = true;
var sampleSize = 4;
var aggregationPipelineLocation = 1; // 2nd item in pipeline array

var config = {
    url: mongourl,
    collection: collectionName,
    options: {
        mongos : {
            ssl: true,
            sslValidate: true,
            ca: ca,
            sslCA: ca,
            poolSize: 1,
            reconnectTries: 1
        }
    }  ,
    randomsample: randomsample,
    sample: {
            size: sampleSize,
            index: aggregationPipelineLocation 
    }
 };
 
// add sampling to aggregation pipeline array
var arrangeAggregationPipeline = function (config, callback){
    
    // default pipeline aggregation for this query
    var aggregationPipeItems = [
        { $project: // change column names for result set 
            {
                Name: "$first_name" + ' ' + "$lastname",
                State: "$admincode1",
                PostalCode: "$postalcode",
                lat: "$latitude",
                lon:  "$longitude",
                Location: ["$latitude", "$longitude"] 
            }
        },
        { $sort: {'State': 1}} // sort by state
    ];
    
    // add randomizer to pipeline
    if (config.randomsample===true){
        var randomizer =  { $sample: { size: config.sample.size } };
        aggregationPipeItems.splice(config.sample.index,0,randomizer);
    }
    callback(null, aggregationPipeItems);
}

// run query, return results
var aggregate = function (db, config, callback) {
    arrangeAggregationPipeline(config, function (err, aggPipeline){
        db.collection(config.collection).aggregate(aggPipeline).toArray(function (err, result) {
            callback(null, result);
        });
    });
};

// ENTRY POINT INTO LIBRARY
// samplesize comes in as string from web server
var mongoQuery = function(samplesize, callback){
 
    if ((samplesize) && (samplesize>0)){
        config.randomsample=true;
        config.sample.size = samplesize;
        config.index= 1;
    } else {
        config.randomsample=false;
    }
 
    // connect to database, return query results
    MongoClient.connect(config.url,config.options, function (err, db) {
        aggregate(db, config, function (err, result) {
            db.close();
            if (err){
                console.log("err=" + err);
            } else {
              console.log(JSON.stringify(result));  
            }
            callback(err, result);
        });
    });
}
module.exports = {
    query: mongoQuery
}

