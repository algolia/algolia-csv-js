module.exports = uploadCSVToAlgolia;

var HttpsAgent = require('agentkeepalive').HttpsAgent;
var Algolia = require('algoliasearch');
var stream = require( 'stream' );

var parse = require('csv-parse');
var fs = require('fs')
var transform = require('stream-transform');
var Batch = require( 'batch-stream' );

function uploadCSVToAlgolia(config) {
  var fileStream = fs.createReadStream(config.inputFile, { autoclose : true });
  var parser = parse({comment: '#', delimiter : config.delimiter, columns: true, auto_parse: true});

  fileStream.pipe( parser )
            .pipe( transform(wrapWithCounter(addObjectID)) )
            .pipe( new Batch({ size: config.batchSize}) )
            .pipe( algoliaSaveStream(config) );
}

function addObjectID(i, data) {
  if(!data.objectID) data.objectID = i;
  return data;
}

function wrapWithCounter(fn) {
  var counter = 0;
  return function(){
    var args = [counter++].concat(Array.from(arguments));
    return fn.apply(undefined, args);
  }
}

function algoliaSaveStream(config) {
  var appId = config.appId;
  var apiKey = config.apiKey;
  var indexName = config.indexName;

  var keepaliveAgent = new HttpsAgent({
      maxSockets: 1,
      maxKeepAliveRequests: 0, // no limit on max requests per keepalive socket
      maxKeepAliveTime: 30000 // keepalive for 30 seconds
  });

  var client = new Algolia(appId, apiKey, keepaliveAgent);
  var index = client.initIndex(indexName);

  var streamToAlgolia = new stream.Stream()
  streamToAlgolia.writable = true;
  streamToAlgolia.write = function (data) {
    console.log('Saving to algolia');
    index.saveObjects(data, function(error, content) {
      if(error) console.error("ERROR: %s", error);
      else console.log('Saved/updated ' + content.objectIDs.length + ' records');
    } );
    return true;
  }
  streamToAlgolia.end = function(data) {
  }

  return streamToAlgolia;
}
