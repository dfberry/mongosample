//Lets require/import the HTTP module
var http = require('http');
var url = require('url');
var database = require('./query.js')
var fileSystem = require('fs');
var path = require('path');
var express = require('express')
var app = express();

//Lets define a port we want to listen to
const PORT=8080; 

app.use('/static', express.static(__dirname + '/../public'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/../public/world.highmap.html'));
});

app.get('/map/world', function (req, res) {
    res.sendFile(path.join(__dirname + '/../public/world.highmap.html'));
});

app.get('/map/world/data', function (req, res) {
    
    var queryData = url.parse(req.url, true).query;
    var rowsRequested = 0;
     
    if (queryData.rows){
        rowsRequested = parseInt(queryData.rows);
    }

    database.query(rowsRequested, function (err, results){
        if (results){
            res.json(results);
        } else if (err){
            res.write("error = " + err);
        } else {
            res.write("done - no error, no results");
        }
    });
    
});

//Lets start our server
app.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});