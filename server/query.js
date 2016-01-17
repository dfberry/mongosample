// native library
var MongoClient = require('mongodb').MongoClient,
    fs = require('fs'),
    path = require('path'),
    privateconfig = require(path.join(__dirname + '/config.json'));

// client certificate
// generated from Compose database overview page under "SSL Public key"
var ca = [fs.readFileSync(path.join(__dirname + privateconfig.mongodb.certificatefile))];

// database config including mongoDB ssl connection
var config = {
    url: privateconfig.mongodb.url,
    collection: privateconfig.mongodb.collection,
    options: {
        mongos : {
            ssl: true,
            sslValidate: true,
            sslCA: ca,
            poolSize: 1,
            reconnectTries: 1
        }
    }
 };

// add $sample config info
config.sample = privateconfig.mongodb.sample;
 
// Purpose: add sampling to aggregation pipeline array
// Params: 
//      config.sample.on: sampling on
//      config.sample.size: count of docs to return
//      config.sample.index: where in pipeline to add $sample
// Returns: complete aggregation pipeline
var arrangeAggregationPipeline = function (config, callback){
    
    // default pipeline aggregation 
    var aggregationPipeItems = [
        { $project: 
            {
                last: "$last_name",
                first: "$first_name",
                lat: "$latitude",
                lon:  "$longitude",
                Location: ["$latitude", "$longitude"],
                _id:0 
            }
        },
        { $sort: {'last': 1}} // sort by last name
    ];

    // add randomizer to pipeline
    if ((config.sample.on===true) && (config.sample.index) && (config.sample.size)){
        var randomizer =  { $sample: { size: config.sample.size } };
        aggregationPipeItems.splice(config.sample.index,0,randomizer);
    }
    
    console.log(aggregationPipeItems);
    
    // return fully defined pipeline
    callback(null, aggregationPipeItems);
}

// Purpose: run query, return docs
// Params: 
//      db: mongoDB database object
//      config: entire config json
// Returns: mongoDB docs as json
var aggregate = function (db, config, callback) {
    arrangeAggregationPipeline(config, function (err, aggPipeline){
        db.collection(config.collection).aggregate(aggPipeline).toArray(function (err, result) {
            callback(null, result);
        });
    });
};

// Purpose: ENTRY POINT INTO LIBRARY
// Params:
//      samplesize: 0=all docs
//      aggregationPipelinePosition: $sample index in aggregationPipeline array
// Returns: mongoDB docs as json
var mongoQuery = function(samplesize, aggregationPipelinePosition, callback){
 
    // configure sampling
    if ((samplesize) && (samplesize>0)){
        config.sample.on=true;
        config.sample.size = samplesize;
        config.sample.index= 1;
    } else {
        config.sample.on=false;
    }

    // configure pipeline position
    if ((aggregationPipelinePosition) 
        && (!isNaN( aggregationPipelinePosition )) 
        && ((aggregationPipelinePosition >= 0 && aggregationPipelinePosition <= 2))){
        config.sample.index = aggregationPipelinePosition;
    } 
 
    console.log(JSON.stringify(config.sample));
 
    // connect to database, return mongoDB docs
    MongoClient.connect(config.url,config.options, function (err, db) {
        aggregate(db, config, function (err, result) {
            db.close();
            if (err){
                console.log("err=" + err);
            } else {
              //console.log(JSON.stringify(result));  
            }
            callback(err, result);
        });
    });
}
module.exports = {
    query: mongoQuery
}

