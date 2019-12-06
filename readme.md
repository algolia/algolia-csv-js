# Algolia CSV toolbox

## What is this project about?

It's a CLI and library to easily upload CSV files to Algolia in an efficient manner
without limitations.

Cool features:
 - uses the header (first line of the csv file) to set the name of the columns
 - automatically detects the types of the fields
 - adds an objectID automatically if not set (useful for public datasets)
 - uses batch best practices to upload to Algolia
 - based on streams

## Installation / usage

### Requirements

 - Node + npm
 - an algolia account and and API key that can upload (not the search API key)

### CLI

```sh
npm install -g algolia-csv
```

You must have a file in which the first row contains the name of all the fields.

```sh
algolia-upload $APP_ID $API_KEY $indexName $file|$url [-d $delimiter] [-b $batchSizer] [--clear-index] [--parse-arrays=$column] [--arrays-delimiter=$delimiter]
```

Mandatory parameters are the aplication id, a key with write rights, the target index name and the input CSV (locally or accessible
with http/https).

Other parameters:
 - `-d` let you set the delimiter used in your file. This should be set in quotes. Default is ','.
 - `-b` let you set the batch size. Default is 10000.
 - `--clear-index` forces the index to be cleared before uploading the new data.
 - `--parse-arrays=column` let you specify if a column value should be split before uploading the data.
   More than one column can be set using this parameter multiple times. Value will be split with `--arrays-delimiter`.
 - `--arrays-delimiter` let you specify the delimiter used to split the values of columns defined with `--parser-arrays`. Default is ','.
 - `--geo-columns=latCol,longCol` let you specify two columns that are to  be used for creating the special algolia attribute `_geoloc`.

### As a library

```sh
npm install --save algolia-csv
```

```javascript
var algoliaCsvTools = require('algolia-csv');

algoliaCsvTools.upload({
  appId: '',
  apiKey: '',
  indexName: '',
  inputFile: '',
  batchSize: 1000,
  delimiter: ',',
  clearIndex: false,
  parseArrays: ['column'],
  arraysDelimiter: '|',
  geoColumns: {lat: 'latCol', 'lng': 'longColumn'}
});
```
