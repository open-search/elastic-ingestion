# Elasticsearch document ingestion

The ingestion library assumes the document ingestion plugin from Elasticasrch has been installed.

This app is composed of two parts - the library and ingestion functions.

The core library located at ```/lib``` contains the api to interact with Elasticsearch.

## Running

The ```cleanIngest``` and ```alias``` functions take a settings object. It is in this format:

```
settings = {
  index: 'myindex',
  alias: 'alias',
  host: 'http://myelasticsearchinstance:9200',
  analyzer: {},
  documentObject: {
    "elastictype": [
      {
        "lastSaveDate": "2015-06-10",
        "file": "Season four episode eight.pdf",
        "title": "Season four episode eight"
      },{
        "lastSaveDate": "2013-05-10",
        "file": "Season two episode two.pdf",
        "title": "Season two episode two"
      }
    ]
  }
}
```

Note the documentObject is an array of the documents to be ingested. They will be into ingested into the index with the type specified in the settings object.

##cleanIngest(config)

A clean ingest deletes the index (which you specify in the config), ingests documents, and optionally aliases an index.

```
let analyzer = JSON.parse(fs.readFileSync('./analyzer.json', 'utf8'));
let pipeline = JSON.parse(fs.readFileSync('./pipeline.json', 'utf8'));
let documentObject = JSON.parse(fs.readFileSync('./documentObject.json', 'utf8'));

let ingest = require('../');

ingest.cleanIngest({
  index: 'myindex',
  host: 'http://localhost:9200',
  analyzer: analyzer,
  pipeline: pipeline,
  documentObject: documentObject
}).then(result => console.log).catch(error => console.log);

```

##alias(config)

This creates an index, aliases it, and deletes previous index.

```
let analyzer = require('./analyzer.json');
let pipeline = require('./pipeline.json');
let documentObject = require('./documentObject.json');

let ingest = require('document-ingestion');

ingest.alias({
  index: `myindex-${Date.now()}`,
  host: 'http://localhost:9200',
  alias: 'myalias',
  analyzer: analyzer,
  pipeline: pipeline,
  documentObject: documentObject,
}).then(console.log).catch(console.error);
```

# API

A short cut api is exposed too:

## getClient(host)

Returns an elasticsearch client bound to the host provided e.g 'http://localhost:9200'. If the same domain is passed, a cached client is returned.

## getPipeline(client, pipelineObject)

Pipeline is an object, if ```pipeline.body``` exists, it is added to elasticsearch. If no body attribute it will assume that a pipeline with name ```pipeLine.name``` already exists in elasticsearch.

Example we need for an attachment ingestion:

```
{
  "name": "attachment",
  "body": {
    "description" : "Attachment ingestion",
    "processors" : [{
      "attachment" : {
        "field" : "data"
      }
    }]
  }
}
```

## createIndex(client, index, analyzer)

## deleteIndex(client, index)

## getAliasIndex(client, alias)

When we want to switch aliases we need to know which index currently aliases. This function takes an elasticsearch client, and an alias, returns a promise which returns the name of the current index or null if the alias does not exist.
