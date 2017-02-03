'use strict';

const rewire = require('rewire');
let ingestion = rewire('../../../');
const test = require('tape').test;

let validConfig = {
  index: 'testindex',
  host: 'test:9200',
  analyzer: {},
  documentObject: {
    type: 'test',
    pipeline: 'testpipeline',
    pathToFiles: '/test',
    documentArray: [{ fileName: 'test',  title: 'test' }],
  },
};

let mockLib = {
  getAliasIndex: (client, index) => Promise.resolve({ alias: 'test' }),
  createIndex: (client, config, analyzer) => Promise.resolve(),
  getPipeline: (client, pipeline) => Promise.resolve(),
  deleteIndex: (index, documentObject) => Promise.resolve(),
};

test('cleanIngest function with invalid config', assert => {
  assert.throws(() => { ingestion.cleanIngest(); }, 'function', 'should throw');
  assert.end();
});

test('cleanIngest function with error from lib', assert => {
  assert.plan(1);

  ingestion.__set__('lib.getClient', host => {
      throw new Error('Some error getting client');
    });

  let result = ingestion.cleanIngest(validConfig);
  result.catch(error => {
    assert.ok(error, 'promise should reject');
  });
});

test('cleanIngest function with previousIndex', assert => {
  assert.plan(1);

  ingestion.__set__('bulkIngest', () => Promise.resolve({ message: 'success' }));
  ingestion.__set__('lib.getPipeline', () => Promise.resolve());
  ingestion.__set__('generateDocumentArray', () => Promise.resolve([[1, 2, 3], [4, 5, 6]]));
  ingestion.__set__('lib.getClient', host => ({
    bulk: () => Promise.resolve(),

    indices: {
      delete: () => Promise.resolve(),

      create: () => Promise.resolve(),

    },
  }));

  let result = ingestion.cleanIngest(validConfig);
  result.then(result => {
    assert.ok(result, 'promise should resolve');
  });
});

test('cleanIngest function with previousIndex and alias', assert => {
  assert.plan(1);

  validConfig.alias = 'testalias';

  ingestion.__set__('bulkIngest', () => Promise.resolve({ message: 'success' }));
  ingestion.__set__('lib.getPipeline', () => Promise.resolve());
  ingestion.__set__('generateDocumentArray', () => Promise.resolve([[1, 2, 3], [4, 5, 6]]));
  ingestion.__set__('lib.getClient', host => ({
    bulk: () => Promise.resolve(),

    indices: {
      delete: () => Promise.resolve(),

      create: () => Promise.resolve(),

      putAlias: () => Promise.resolve(),

    },
  }));

  let result = ingestion.cleanIngest(validConfig);
  result.then(result => {
    assert.ok(result, 'promise should resolve');
  });
});
