'use strict';

let analyzer = require('./analyzer.json');
let pipeline = require('./pipeline.json');
let documentObject = require('./documentObject.json');

let ingest = require('../');

ingest.alias({
  index: 'myindex-' + Date.now(),
  host: 'http://localhost:9200',
  alias: 'myindex',
  analyzer: analyzer,
  pipeline: pipeline,
  documentObject: documentObject,
}).then(console.log).catch(console.error);
