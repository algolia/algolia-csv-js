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
Separator must be `,`.

```sh
algolia-upload $ALGOLIA_APPLICATION_ID $ALGOLIA_API_KEY $INDEX_NAME $PATH_TO_CSV
```

### As a library

```sh
npm install --save-dev algolia-csv
```

```javascript
var algoliaCsvTools = require('algolia-csv');

algoliaCsvTools.upload({
  appId: '',
  apiKey: '',
  indexName: '',
  inputFile: '',
  batchSize: 1000,
  delimiter: ','
});
```
