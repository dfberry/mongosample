// native library
var MongoClient = require('mongodb').MongoClient;
var fs = require('fs');
var path = require('path');
var privateconfig = require(path.join(__dirname + '/config.json'));
 console.log(privateconfig);


// client certificate
// generated from database overview page under "SSL Public key"
var ca = [fs.readFileSync(path.join(__dirname + privateconfig.mongodb.certificatefile))];
console.log(path.join(__dirname + privateconfig.mongodb.certificatefile));


var config = {
    url: privateconfig.mongodb.url,
    collection: privateconfig.mongodb.collection,
    options: {
        mongos : {
            ssl: true,
            sslValidate: true,
            ca: ca,
            sslCA: ca,
            poolSize: 1,
            reconnectTries: 1
        }
    }
 };
 console.log(config);
 config.sample = privateconfig.mongodb.sample;
 console.log(config);
 
// add sampling to aggregation pipeline array
var arrangeAggregationPipeline = function (config, callback){
    
    // default pipeline aggregation for this query
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
            console.log(aggregationPipeItems);
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
var mongoQuery = function(samplesize, aggregationPipelinePosition, callback){
 
    if ((samplesize) && (samplesize>0)){
        config.sample.on=true;
        config.sample.size = samplesize;
        config.sample.index= 1;
    } else {
        config.sample.on=false;
    }

    if ((aggregationPipelinePosition) 
        && (!isNaN( aggregationPipelinePosition )) 
        && ((aggregationPipelinePosition >= 0 && aggregationPipelinePosition <= 2))){
        console.log("setting aggregationPipelinePosition=" + aggregationPipelinePosition);
            
        config.sample.index = aggregationPipelinePosition;
    } 
    
    console.log(JSON.stringify(config.sample)); 
 
    // connect to database, return query results
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

