'use strict';

const analyzer = require('./analyzer.json');
const pipeline = require('./pipeline.json');
const path = require('path');

const rd = require('readiry');
const ingest = require('../');

rd.readDeepDirectory(path.normalize('./files'), { DS_Store: null }, processFile)
  .then(documents => {

    let documentObject = {
      documents: [],
    };

    documentObject.documents = documents;

    ingest.alias({
      index: 'myindex-' + Date.now(),
      host: 'http://localhost:9200',
      alias: 'myindex',
      analyzer: analyzer,
      pipeline: pipeline,
      documentObject: documentObject,
    }).then(console.log).catch(console.error);

  });

function processFile(fileObject) {
  let result = {};
  result.title = formatTitle(fileObject.file);
  result.download = 'downloads/' + fileObject.file;
  result.file = fileObject.file;
  result.createdTime = fileObject.ctime;
  result.modifiedTime = fileObject.mtime;
  return result;
}

function formatTitle(filePath) {
  let raw = filePath.split('/');
  let result = raw[raw.length - 1];
  result = result.substring(0, result.lastIndexOf('.'));
  result = result.replace(/_|-|\./g, ' ');
  result = result.replace(/ {1,}/g, ' ');
  result = result[0].toUpperCase() + result.substr(1);
  return result;
}
