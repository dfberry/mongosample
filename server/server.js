var url = require('url'),
    fileSystem = require('fs'),
    path = require('path'),
    express = require('express'),
    app = express();


var database = require(path.join(__dirname + '/query.js'));
console.log(path.join(__dirname + '/query.js'));

//Lets define a port we want to listen to
const PORT=8080; 

app.use('/public', express.static(__dirname + '/../public'));

app.get(['/', '/map/'], function (req, res) {
  res.sendFile(path.join(__dirname + '/../public/highmap/world.highmap.html'));
});

app.get('/map/data', function (req, res) {
    
    var queryData = url.parse(req.url, true).query;
    var rowsRequested = 0;
    var aggregationPipelinePosition = 1; //2nd position
     
    if (queryData.rows){
        rowsRequested = parseInt(queryData.rows);
        console.log("server rowsRequested=" + rowsRequested);
    }
    
    if (queryData.pos){
        aggregationPipelinePosition = parseInt(queryData.pos);
        console.log("server pipelineposition=" + queryData.pos);
    } 

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

//Lets start our server
app.listen(PORT, function(){
    console.log("Server listening on: http://localhost:%s", PORT);
});