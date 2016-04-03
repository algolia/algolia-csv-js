#! /usr/bin/env node
var algoliaCSVTools = require('../lib');

var config = readConfig(process.argv);
if(!config) return 1;
algoliaCSVTools.import(config);

function readConfig(argv) {
  var args = argv.slice(2);
  if( args.length !== 4) {
    console.error( "Usage : algolia-upload APP_ID API_KEY indexName file" );
    return undefined;
  }

  return {
    appId: args[0],
    apiKey: args[1],
    indexName: args[2],
    inputFile: args[3],
    batchSize: 1000,
    delimiter: ','
  };
}

