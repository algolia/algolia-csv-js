#! /usr/bin/env node
var parseArgs = require('minimist');
var algoliaCSVTools = require('../lib');

var config = readConfig(process.argv);
if(!config) return 1;

algoliaCSVTools.import[config.inputType](config);

function readConfig(argv) {
  var args = parseArgs(argv.slice(2));
  var urlStartPattern = /http(?:s)*:\/\//;

  if( args._.length !== 4) {
    console.error( "Usage : algolia-upload APP_ID API_KEY indexName file|url [-d ','] [-b 10000] [--clear-index] [--parse-arrays=column]" );
    return undefined;
  }

  var parseArrays;
  if(Array.isArray(args['parse-arrays'])) parseArrays = args['parse-arrays']
  else if(typeof args['parse-arrays']) parseArrays = [args['parse-arrays']];

  return {
    appId: args._[0],
    apiKey: args._[1],
    indexName: args._[2],
    input: args._[3],
    inputType: (urlStartPattern.test(args._[3]) ? 'url' : 'file'),
    batchSize: args['b'] || 10000,
    delimiter: args['d'] || ',',
    clearIndex: args['clear-index'] || false,
    parseArrays: parseArrays || false
  };
}
