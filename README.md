# composeio
Script for compose.io

stream-insert4: 104957.237ms streamtomongo.js over https mockdata 1000 rows
native-insert2: 3262.309ms native-insert.js over https mockdata 1000 rows

Getting certificate from composeio
https://www.compose.io/articles/going-ssl-with-compose-mongodb-plus/

MongoClient options
http://mongodb.github.io/node-mongodb-native/2.1/api/MongoClient.html#.connect
MongoClient.connect(url, options, callback)

convert to geojson
    db.collection(collectionName).find().each(function(err, doc) {
    
        doc.coordinates= { location: { type: 'point', coordinates : [doc.latitude, doc.longitude]}}; // convert field to string
        db.collection(collectionName).save(doc);
        console.log("doc " + i++);
    });


mongo - $sample
http://www.thecodebarbarian.com/node-perspective-on-mongodb-3.2-$lookup-$sample
http://stackoverflow.com/questions/23961368/mongodb-how-create-a-new-array-field-with-the-aggregate-framework
http://tugdualgrall.blogspot.com/2014/08/introduction-to-mongodb-geospatial.html

geonear - https://docs.mongodb.org/manual/reference/operator/aggregation/geoNear/#pipe._S_geoNear

Aggregation result must be under 16MB. If you are using shards, the full data must be collected in a single point after the first $group or $sort.
$match only purpose is to improve aggregation's power, but it has some other uses, like improve the aggregation performance.
{$group: {_id: null, count: {$sum: 1}}}

http://www.redotheweb.com/2012/10/12/mongodb-new-aggregation-framework-and-sql-side-by-side.html

random - "poor randomness"


Idea: something with webhooks - live/real-time open-source webhooks?
moving aware from webhooks 

    capture webhooks into db for testing
        capture web request (assume webhook) into db
    generate webhook data from data being entered
        turn on webhook on compose mongodb
        insert data
    view webhook data
        view webhook generated data 

Idea: something with geolocation/map, current, 30 days, 1 year
    http://www.opendatanetwork.com/dataset/data.seattle.gov/kzjm-xkqj
    Seattle fire calls - updated every 5 mins
    geolocation, timedate, type
    http://www.opendatanetwork.com/dataset/data.seattle.gov/3k2p-39jp
    Seattle 911 incidents - updated every 4 hours
    geolocation, timedate, type
    https://data.seattle.gov/Transportation/Seattle-Traffic-Cameras/65fc-btcc
    Seattle traffic cams, street address, no lat/long
    https://data.seattle.gov/dataset/Seattle-Major-Crimes-Last-48-Hours/vtr2-wp3r
    major crimes, last 48 hrs, lat/long, lots of codes - not much to 'read'
    
    stream data into mongo
        https://www.npmjs.com/package/stream-to-mongo
        https://data.seattle.gov/views/INLINE/rows.json?accessType=WEBSITE&method=getByIds&asHashes=true&start=0&length=50&meta=true
        https://data.seattle.gov/views/INLINE/rows.json?accessType=WEBSITE&method=getByIds&asHashes=true&start=0&length=50&meta=true
        
        Socrata
        https://www.npmjs.com/package/sodajs-socrata

        my socrata app token : DLjWeqRNj61vaEGwGJIMQu0IZ
        secret token: Ljg_ZF2TDM7VmMRbOcqYA5Kst7_5FHy1ffFL
        
        Koop -Transform, query, & download geospatial data on the web. 
        https://github.com/koopjs/koop
        
        
    remove specific data if possible, only grab data relevant
    is cost based on size in, or request volume out?
    
    visual aggregation out on map - script or website?
    script doesn't really have that pow
    
    
Idea: nasa open data
    https://open.nasa.gov/open-data/
    