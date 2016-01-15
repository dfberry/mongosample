#Prototyping in MongoDB with the $sample keyword

##Introduction
MongoDB added the [$sample](https://docs.mongodb.org/manual/reference/operator/aggregation/sample/#pipe._S_sample) keyword as part of the version 3.2 [aggregation framework enhancements](https://docs.mongodb.org/manual/release-notes/3.2/#aggregation-framework-enhancements). The $sample keyword allows the query to return a random subset of the data. 

##Random data
SQL databases have included the ability to generate this same type of random data with two different ideas: random and top. Die-hard database developers have had long debates about the randomness of the data and the accuracy of the query. 

Mongo prototype developers can now use the $sample keyword in the aggregation pipe to produce a the same type of random subset. 

##The World Map as a visual example
In order to show how the random sampling works in the mongo query, the website will show the world map and display random latitude/longitude points on the map. Each refresh of the page will produce new random points. Below the map, the docs will display. 

![](/public/images/world.png)

Once the website is up and working with data points, we will play with the query to see how the data points change in response. 

##Overview of Steps to complete example
This article assumes you have no mongodb, no website, and no data. It does assume you have an account on [ComposeIO](http://www.composeio.com). Each step is broken out and explained. If there is a step you already have, skip to the next. 

1. get the NodeJS Express website running to display a map of the world with no data
2. setup the [ComposeIO](http://www.compose.io) deployment of MongoDB+ ssl database and modify /server/config.json with new mongoDB+ url
3. get the mock data from [Mockaroo](http://www.mockaroo.com) including latitude and longitude
4. insert the mock data with the insert.js script
5. update mock data types 
6. verify world map displays points of latitude & longitude

When the code works and the world map displays with data points, we will play with it to see how $sample impacts the results.

1. understand the $sample code in /server/query.js
2. change the row count
3. change the aggregation pipeline order
 
If you want to skip to an online working example, this code is hosted [here](http://s.dfberry.io). 

###System architecture
The ***data import script*** is /insert.js. It opens and inserts a json file into a mongoDB collection. It doesn't do any transformation. 

The ***data update script*** is /update.js. It updates the data to numeric and geojson types.

The ***server*** is a nodeJs Express website using the native MongoDB driver. The code uses the filesystem, url, and path libraries. This is a bare-bones express website. The /server/server.js file is the web server, with /server/query.js as the database layer. The server runs at http://127.0.0.1:8080. This address is routed to /public/highmap/world.highmap.html. The data query will be made to http://127.0.0.1:8080/map/data/ from the client file /public/highmap/world.highmap.js.  

The ***client*** files are in the /public directory. The main file is the /highmap/world.highmap.html file. It uses jQuery as the javascript framework, and [highmap](http://www.highcharts.com/maps/demo) as the mapping library which plots the points on the world map. The size of the map is controlled by the /public/highmap/world.highmap.css stylesheet for the map id.

A /dropcollection.js ***cleanup*** file is provided to remove the collection when you are done. 

###Step 1: The NodeJS Express Website
In order to get the website up and going you need to clone this repository, make sure node is installed, and install the dependency libraries found in package.json. 

```
npm install
```

Once the dependencies are installed, you can start the web server.

```
npm start
```
Request the website to see the world map. There won't be any data points on it until later, but the map should display successfully.

[http://127.0.0.1:8080](http://127.0.0.1:8080)

###Step 2: Setup the [ComposeIO](http://compose.io) MongoDB+ Deployment & Database

If you already have a MongoDB+ deployment with SSL to use, and have the following items, you can move on to the next section:
* 	database user name
* 	database user password
* 	deployment public SSL key in the /server/clientcertificate.pem file
* 	connection string for that deployment 

Create a new deployment on ComposeIO for a MongoDB+ database with an SSL connection. 

![mongoDB+SSL.png](/public/images/mongoDB+SSL.png)

While still on the [ComposeIO](http://compose.io) backoffice, open the new deployment and copy the connection string. 

![composeio-ssl.png](/public/images/composeio-ssl.png)

You will need to **entire connection string** in order to insert, update, and query the data. The connection string uses a user and password at the beginning and the database name at the end. 

You also need to get the SSL Public key from the Deployment Overview page. You will need to login with your ComposeIO user password in order for the public key to show. 

![composeiosslpublickey.png](/public/images/composeiosslpublickey.png)

***Todo***: Save the entire **SSL Public key** to /server/clientcertificate.pem. 

If you save it somewhere else, you need to change the mongodb.certificatefile setting in /server/config.json.

You will also need to create a user in the Deployment's database. 

![adduser.png](/public/images/adduser.png)

***Todo***: Create new database user and password. Once you create the **user name** and **user password**, edit the connection string for the user, password, and database name.  

*connection string format*
```
mongodb://USER:PASSWORD@URL:PORT,URL2:PORT2/DATABASENAME?ssl=true
```

*connection string example*
```
mongodb://myname:myuser@aws-us-east-1-portal.2.dblayer.com:10907,aws-us-east-1-portal.3.dblayer.com:10962/mydatabase?ssl=true
```

***Todo***: Change the mongodb.url setting in the /server/config.json file to this new connection string.

###Step 3: The Prototype Data 
If you already have latitude and longitude data, or want to use the mock file included at /data/mockdata.json, you can skip this step.

Use [Mockeroo](https://www.mockaroo.com) to generate your data. This allows you to get data, including latitude and longitude quickly and easily. Make sure to add the latitude and longitude data in json format.

![mockaroo.png](/public/images/mockaroo.png)

Make sure you have at least 1000 records for a good show of randomness and save the file as **mockdata.json** in the data subdirectory.

***Todo***: Create mock data and save to /data/mockdata/json.

###Step 4: Insert the Mock Data into the mockdata Collection
The insert.js file converts the /data/mockdata.json file into the mockdata collection in the database.

This script uses the native MongoDB driver and the filesystem node package. 

The configuration is kept in the  /server/config.json file. Make sure it is correct for your mongoDB url, user, password, database name, collection name and mock data file location. The configuration is read in and stored in the privateconfig variable. 

The **mongos** section of the config variable is for the SSL mongo connection. You shouldn't need to change any values.

*insert.js*

```
var MongoClient = require('mongodb').MongoClient,  
  fs = require('fs'),
  path = require('path');

var privateconfig = require(path.join(__dirname + '/config.json'));
 console.log(privateconfig);

var ca = [fs.readFileSync(path.join(__dirname + privateconfig.mongodb.certificatefile))];
var data = fs.readFileSync(path.join(__dirname + privateconfig.mongodb.data), 'utf8');
var json = JSON.parse(data);

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
    if (err) {
        console.log(err);
    } else {
        console.log("connected");
        db.collection(privateconfig.mongodb.collection).insert(json, function (err, collection) {
            if (err) console.log((err));
            db.close();
            console.log('finished');
        }); 
    }  
});
```

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

The fine print of the $sample says the data may duplicate within a single query. On this map that would appear as less than the number of requested data points. Did you see that in your tests? 

##How $sample impacts the results
Now that the website works, let's play with it to see how $sample impacts the results.

###Understand the $sample code in /server/query.js
The [$sample](https://docs.mongodb.org/manual/reference/operator/aggregation/sample/#pipe._S_sample) keyword controls random sampling of the query in the [aggregation pipeline](https://docs.mongodb.org/manual/core/aggregation-pipeline/). 

The pipeline used in this article is a series of array elements in the **arrangeAggregationPipeline** function in the /server/query.js file. The first array element is the $project section which controls what columns to return, and how they are named. 


*arrangeAggregationPipeline()*
```
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
```
The next step in the pipeline is the sorting of the data by last name. If the pipeline runs this way (without $sample), all documents are returned. Alternately, if the url value for rows is zero (0), or doesn't exist, all rows will be returned.  
 
![](allrows.png)

 [http://127.0.0.1:8080/?rows=5&pos=2](http://127.0.0.1:8080/?rows=5&pos=2).

![](/public/images/nowithnosample.png) 

The location of $sample is controlled by the pos value in the url. If it is set to 1 so with a zero-based array, it will be applied between $project and $sort. If the code runs as supplied, the set of data is randomized, 5 documents are selected, then the 5 rows are sorted. This would be meaningful in both that the data is random, and returned sorted. 

If the $sample is moved to the first position, still before the sort is applied, that same result. But, however, if the $sample is the last item (pos=2), the entire set is sorted, then 5 rows selected. The requests are no longer sorted.

Change the url to [http://127.0.0.1:8080/?rows=5&pos=2](http://127.0.0.1:8080/?rows=5&pos=2) where the $sample is after the sort. 

![](image.)

Note that while 5 documents are returned, they are not in sorted order. If they are in sorted order, it isn't because they were sorted but because the random pick happend that way on accident, not on purpose. 

![](Snip20160114_8.png)





Now apply the  



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