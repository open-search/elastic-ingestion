const rewire = require('rewire');
let ingestion = rewire('../..');
const test = require('tape').test;

let validConfig = {
  index: 'testindex',
  alias: 'testalias',
  host: 'test:9200',
  analyzer: {},
  documentObject: {
    type: 'test',
    pipeline: 'testpipeline',
    pathToFiles: '/test',
    documentArray: [{ fileName: 'test',  title: 'test' }],
  },
};

test('alias function with invalid config', assert => {
  assert.throws(() => { ingestion.alias(); }, 'function', 'should throw');
  assert.end();
});

test('alias function with error from lib', assert => {
  assert.plan(1);

  ingestion.__set__('lib.getClient', host => {
      throw new Error('Some error getting client');
    });

  let result = ingestion.alias(validConfig);
  result.catch(error => {
    assert.ok(error, 'promise should reject');
  });
});

test('alias function without previousIndex', assert => {
  assert.plan(1);

  ingestion.__set__('bulkIngest', () => Promise.resolve({ message: 'success' }));
  ingestion.__set__('lib.getPipeline', () => Promise.resolve());
  ingestion.__set__('generateDocumentArray', () => Promise.resolve([[1, 2, 3], [4, 5, 6]]));
  ingestion.__set__('lib.getClient', host => ({
    bulk: () => Promise.resolve(),

    indices: {
      updateAliases: () => Promise.resolve(),

      putAlias: () => Promise.resolve(),

      create: () => Promise.resolve(),

      get: () => Promise.resolve({ testindex: { aliases: ['testalias'] } }),

      delete: () => Promise.resolve(),

    },
  }));

  let result = ingestion.alias(validConfig);
  result.then(result => {
    assert.ok(result, 'promise should resolve');
  });
});

test('alias function with previousIndex', assert => {
  assert.plan(1);

  ingestion.__set__('lib.getAliasIndex', () => Promise.resolve('testindex'));

  let result = ingestion.alias(validConfig);
  result.then(result => {
    assert.ok(result, 'promise should resolve');
  });
});
