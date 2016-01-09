var Writable = require('stream').Writable;
var util = require('util');
var MongoClient = require('mongodb').MongoClient;

util.inherits(StreamToMongo, Writable);

module.exports = StreamToMongo;

function StreamToMongo(options) {
  if(!(this instanceof StreamToMongo)) {
    return new StreamToMongo(options);
  }
  Writable.call(this, { objectMode: true });
  this.config = options;
}


StreamToMongo.prototype._write = function (obj, encoding, done) {
  var self = this;
  if (!this.db) {
    MongoClient.connect(this.config.db, this.config.dboptions, function (err, db) {
      if (err) throw err;
      self.db = db;
      self.on('finish', function () {
        self.db.close();
      });
      self.collection = db.collection(self.config.collection);
      self.collection.insert(obj, { w: 1 }, done);
    });
  } else {
    self.collection.insert(obj, { w: 1 }, done);
  }
};