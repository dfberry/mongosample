#Prototyping in MongoDB with the $sample keyword

##Introduction
MongoDB added the [$sample](https://docs.mongodb.org/manual/reference/operator/aggregation/sample/#pipe._S_sample) keyword as part of the version 3.2 [aggregation framework enhancements](https://docs.mongodb.org/manual/release-notes/3.2/#aggregation-framework-enhancements). The $sample keyword allows the query to return a random subset of the data. 

##Random data
SQL databases have included the ability to generate this same type of random data with two different ideas: random and top. Die-hard database developers have had long debates about the randomness of the data and the accuracy of the query. 

Mongo prototype developers can now use the $sample keyword in the aggregation pipe to produce a the same type of random subset. This is a new feature and only applies to the aggregation pipeline. By adding it to the aggregation pipeline, you can choose where in the munging of the data to grab the subset.

##Showing $sample
In order to show how the random sampling works in the mongo query, the website will show the world map and display 5 random latitude/longitude points on the map. Each refresh of the page will produce 5 new random points. 

![](/public/images/world.png)

Once the website is up and working with data points, we will play with the query to see how the data points change in response. 

##Overview of Steps to complete exercises
This article assumes you have no mongodb, no website, and no data. It does assume you have an account on ComposeIO. Each step is broken out and explained. If there is a step you already have, skip to the next. 

1. get the NodeJS Express website running to display a map of the world
2. get the mock data from [mockaroo](http://www.mockaroo.com) including latitude and longitude
3. setup the [ComposeIO](http://www.composeio.com) deployment of MongoDB+ ssl database
4. insert the mock data with the insert.js script
5. update mock data types 
6. change the website files to connect to MongoDB+ ssl database
7. verify world map displays points of latitude & longitude

When the code works and the world map displays with data points, we will play with it to see how $sample impacts the results.

1. understand the $sample code in /server/query.js
2. change the row count
3. change the aggregation pipeline order
 
If you want to skip to an online working example, this code is hosted [here](http://s.dfberry.io). 

###System architecture
The ***data import script*** is /insert.js. It opens and inserts a json file into a mongoDB collection. It doesn't do any transformation. 

The ***data update script*** is /update.js. It updates the data to numeric and geojson types.

The ***server*** is a nodeJs Express website using the native MongoDB driver. The code uses the filesystem, url, and path libraries. This is a bare-bones express website. The /server/server.js file is the web server, with /server/query.js as the database layer. The server runs at http://127.0.0.1:8080. This address is routed to /public/world.highmap.html. The data query will be made to http://127.0.0.1:8080/map/world/data/?rows=5 from the client file /public.world.highmap.js.  

The ***client*** files are in the /public directory. The main file is the world.highmap.html file. It uses jQuery as the javascript framework, and [highmap](http://www.highcharts.com/maps/demo) as the mapping library which plots the points on the world map. The size of the map is controlled by the world.highmap.css stylesheet for the container class.

A /dropcollection.js ***cleanup*** file is provided to remove the collection when you are done. 

###Step 1: The NodeJS Express Website


In order to get the website up and going you need to clone this repository, make sure node is installed, and install the dependency libraries found in package.json. 

```
npm install
```

Once the dependencies are installed, you can start the web server.

```
node server/server.js
```
Request the website to see the world map. There won't be any data points on it until later, but the map should display successfully.

[http://127.0.0.1:8080](http://127.0.0.1:8080)

###Step 2: The Prototype Data 
Use mockeroo to generate your data. This allows you to get data, including latitude and longitude quickly and easily. Make sure to add the latitude and longitude data in json format.

![mockaroo.png](/public/images/mockaroo.png)

Make sure you have at least 1000 records for a good show of randomness and save the file as **mockdata.json** in the data subdirectory.

###Step 3: Setup the Deployment & Database

If you already have a MongoDB+ deployment to use, and have the following items, you can move on to the next section:
* 	database user name
* 	database user password
* 	deployment public SSL key in the clientcertificate.pem file
* 	connection string for that deployment 

Create a new deployment on ComposeIO for a MongoDB+ database with an SSL connection. 

![mongoDB+SSL.png](/public/images/mongoDB+SSL.png)

While still on the ComposeIO backoffice, open the new deployment and copy the connection string. You will need to **entire connection string** in order to insert, update, and query the data. The connection string uses a user and password at the beginning. We will create this later.

You also need to get the SSL Public key from the Deployment Overview page. You will need to login with your ComposeIO user password in order for the public key to show. Save the entire **SSL Public key** to a file with the name clientcertificat.pem in the server subfolder. 

![composeio-ssl.png](/public/images/composeio-ssl.png)
![composeiosslpublickey.png](/public/images/composeiosslpublickey.png)

You will also need to create a user in the Deployment's database. Once you create the **user name** and **user password**, edit the connection string to use that information. 

![adduser.png](/public/images/adduser.png)


###Step 4: Insert the Mock Data into the mockdata Collection
The insert.js file converts the mockdata.json file into the mockdata collection in the database.

Before running the **insert.js** script, the public key and database connection string should change to match what is available to you.  

This script uses the native MongoDB driver and the filesystem node package. 

The **mongos** section of the configuration object is for the SSL mongo connection. You shouldn't need to change any values.

*insert.js*

```
var MongoClient = require('mongodb').MongoClient,  
  fs = require('fs');

var collectionName  = 'mockdata';
var connectionstring = 'mongodb://username:userpassword@aws-us-east-1-portal.2.dblayer.com:10907,aws-us-east-1-portal.3.dblayer.com:10962/mytestdb?ssl=true'; 

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

```


The **mockdata** collection is created with this script. The public SSL key is loaded from the clientcertificate.pem file into an array and named **ca**. 

Run the insert script.

```
node insert.js
```

If you create an SSL database but don't pass the certificate, you won't be able to connect to it. You will get a **sockets closed** error. 

Once you run the script, make sure you can see the documents in the database's **mockdata** collection.

###Step 5: Convert latitude & longitude from string to floats
The mock data's latitude and longitude are strings. Use the **update.js** file to convert the strings to floats as well as create the geojson values. In order to use this file, you will need to change the connectionstring value. If you put the clientcertificate.pem in the server subfolder in the previous step, you shouldn't have to change any other values. 

*update.js*

```
var MongoClient = require('mongodb').MongoClient,  
  fs = require('fs');

var collectionName  = 'mockdata';
var connectionstring = 'mongodb://username:userpassword@aws-us-east-1-portal.2.dblayer.com:10907,aws-us-east-1-portal.3.dblayer.com:10962/mytestdb?ssl=true'; 

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
```

Run the insert script.

```
node update.js
```
###Step 6: Change the Website file to connect to MongoDB+

The website's **query.js** file needs to be changed for the connectionstring, collection name, and client certificate file. These are all listed at the top of the /server/query.js file.

Once these items are changed, the website should return random data points on the map. 

We will go over the file in more detail later. 

*query.js*

```
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
```

###Step 7: Verify the world map displays random sampling points
Refresh the web site several times. This should show different points each time. The variation of randomness should catch your eye. Is it widely random, or not as widely random as you would like?

The fine print of the $sample says the data may duplicate within a single query. On this map that would appear as less than 5 data points. Did you see that in your tests? 


##How $sample impacts the results
Now that the website works, let's play with it to see how $sample impacts the results.

###Understand the $sample code in /server/query.js
The [$sample](https://docs.mongodb.org/manual/reference/operator/aggregation/sample/#pipe._S_sample) keyword controls random sampling of the query in the [aggregation pipeline](https://docs.mongodb.org/manual/core/aggregation-pipeline/). 

The pipeline is a series of array elements in the **arrangeAggregationPipeline** function in the /server/query.js file. The first array element is the $project section which controls what columns to return, how they are named, and data concatenation such as first and last name. When that step is completed the next step of the pipeline will happen. 

```
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
```
The next step in the pipeline is the sorting of the data by state. Since the points are returned on a map, the sorting isn't important but the same query could also be used for a grid or spreadsheet-style layout -- where initial sorting of the data would be meaningful. 

The **config** parameter at the top of the file controls if sampling is applied, how many documents are returned, and where in the pipeline



####$sample and the aggregation pipeline


###Change the row count
The count of rows is a parameter in the url to the server, when the data is request. In order to change the row count, the client-side public jQuery file that makes the request needs to be changed. 

The ***/public/world.highmap.js*** file is called when the /public/world.highmap.html page is loaded. The world.highmap.js file calls the server for data points, then hands these data points to the highmap library to plot on the world map. 

The /public/world.highmap.js code requests 5 rows of data from the server. This value is passed back to /server/server.js, which is passed to /server/query.js. In order to request more rows, change the ***randomRowCount*** variable at the top of the loadWorld() function in /public/world.highmap.html. Change that value to 10, and refresh the browser page. 

*Note: if the value is 0, all rows are returned.* 

*world.highmap.js*
```
$(function () {
   loadWorld();    
});

function loadWorld(){
    
    var randomRowCount = 10;
 
    $.get( "http://127.0.0.1:8080/map/world/data/?rows=" + randomRowCount, function( latLongPoints ) {

        var worldMap = Highcharts.maps['custom/world-continents'];

        $('#container').highcharts('Map', {
            title: {
                text: 'World'
            },
            series: [{
                mapData: worldMap,
                showInLegend: false      

            },{
                type: 'mappoint',
                data: latLongPoints,
                showInLegend: false            
            }]
        });
    }); 
}
```
![](/public/images/worldmap10datapoints.png)

###Change the aggregation pipeline order