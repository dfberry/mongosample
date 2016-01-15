var url = require('url'),
    fileSystem = require('fs'),
    path = require('path'),
    express = require('express'),
    app = express();

var database = require(path.join(__dirname + '/query.js'));
const PORT=8080; 

// public files (img, css, js, html)
app.use('/public', express.static(__dirname + '/../public'));

// default route
app.get(['/', '/map/'], function (req, res) {
  res.sendFile(path.join(__dirname + '/../public/highmap/world.highmap.html'));
});

// api-data route
app.get('/map/data', function (req, res) {
    
    var rowsRequested = 0; // all rows
    var aggregationPipelinePosition = 1; //2nd position
     
    // get query params
    var queryData = url.parse(req.url, true).query;
    if (queryData.rows) rowsRequested = parseInt(queryData.rows);
    if (queryData.pos) aggregationPipelinePosition = parseInt(queryData.pos);

    // request data
    database.query(rowsRequested, aggregationPipelinePosition, function (err, results){
        if (results){
            res.json(results);
        } else if (err){
            res.write("error = " + err);
        } else {
            res.write("done - no error, no results");
        }
    });
});

//start server
app.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});