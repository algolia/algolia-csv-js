module.exports = {
  file: uploadCSVFileToAlgolia,
  url: uploadCSVFromURLToAlgolia
};

var HttpsAgent = require('agentkeepalive').HttpsAgent;
var Algolia = require('algoliasearch');
var stream = require( 'stream' );
var request = require( 'request' );

var parse = require('csv-parse');
var fs = require('fs')
var transform = require('stream-transform');
var Batch = require( 'batch-stream' );

function uploadCSVToAlgolia(inputStream, config) {
  console.log('Parsing CSV');
  var parser = parse({comment: '#', delimiter : config.delimiter, columns: true, auto_parse: true});

  var transforms = [];
  if(config.parseArrays) transforms.push(transform(parseArrays.bind(undefined, config.parseArrays, config.arraysDelimiter)));
  if(config.geoColumns) transforms.push(transform(geoColumificater.bind(undefined, config.geoColumns)));

  var csvStream = transforms.reduce(function(stream, t){
    return stream.pipe(t);
  }, inputStream.pipe(parser));

  csvStream.pipe(transform(wrapWithCounter(addObjectID)))
           .pipe(new Batch({ size: config.batchSize}))
           .pipe(algoliaSaveStream(config));
}

function uploadCSVFileToAlgolia(config) {
  console.log('Reading from file : ' + config.input);
  var fileStream = fs.createReadStream(config.input, { autoclose : true });
  uploadCSVToAlgolia(fileStream, config);
}

function uploadCSVFromURLToAlgolia(config) {
  console.log('Reading from http : ' + config.input);
  var httpStream = request(config.input)
  uploadCSVToAlgolia(httpStream, config);
}

function addObjectID(i, data) {
  if(!data.objectID) data.objectID = i;
  return data;
}

function parseArrays(columnsToParse, arraysDelimiter, data) {
  var res = {};
  Object.keys(data).forEach(function(k) {
    if(columnsToParse.indexOf(k) !== -1) res[k] = data[k].split(arraysDelimiter);
    else res[k] = data[k];
  });
  return res;
}

function geoColumificater(geoColumns, data) {
  if(!data[geoColumns.lat] || !data[geoColumns.lng]) return data;

  var res = Object.assign({}, data);
  res['_geoloc'] = {
    'lat': data[geoColumns.lat],
    'lng': data[geoColumns.lng]
  };

  return res;
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
  if(config.clearIndex) {
    console.log('Clearing data in index');
    index.clearIndex();
  }

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
