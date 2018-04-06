const rewire = require('rewire');
const ingestion = rewire('../..');
const test = require('tape').test;

const validConfig = {
  index: 'testindex',
  host: 'test:9200',
  analyzer: {},
  documentObject: {
    type: 'test',
    pipeline: 'testpipeline',
    pathToFiles: '/test',
    documentArray: [{ fileName: 'test', title: 'test' }],
  },
};

test('cleanIngest function with invalid config', (assert) => {
  assert.throws(() => { ingestion.cleanIngest(); }, 'function', 'should throw');
  assert.end();
});

test('cleanIngest function with error from lib', (assert) => {
  assert.plan(1);

  ingestion.__set__('lib.getClient', () => {
    throw new Error('Some error getting client');
  });

  ingestion.cleanIngest(validConfig)
    .catch((error) => {
      assert.ok(error, 'promise should reject');
    });
});

test('cleanIngest function with previousIndex', (assert) => {
  assert.plan(1);

  ingestion.__set__('bulkIngest', () => Promise.resolve({ message: 'success' }));
  ingestion.__set__('lib.getPipeline', () => Promise.resolve());
  ingestion.__set__('generateDocumentArray', () => Promise.resolve([[1, 2, 3], [4, 5, 6]]));
  ingestion.__set__('lib.getClient', () => ({
    bulk: () => Promise.resolve(),
    indices: {
      delete: () => Promise.resolve(),
      create: () => Promise.resolve(),
    },
  }));

  ingestion.cleanIngest(validConfig)
    .then((result) => {
      assert.ok(result, 'promise should resolve');
    });
});

test('cleanIngest function with previousIndex and alias', (assert) => {
  assert.plan(1);

  validConfig.alias = 'testalias';

  ingestion.__set__('bulkIngest', () => Promise.resolve({ message: 'success' }));
  ingestion.__set__('lib.getPipeline', () => Promise.resolve());
  ingestion.__set__('generateDocumentArray', () => Promise.resolve([[1, 2, 3], [4, 5, 6]]));
  ingestion.__set__('lib.getClient', () => ({
    bulk: () => Promise.resolve(),
    indices: {
      delete: () => Promise.resolve(),
      create: () => Promise.resolve(),
      putAlias: () => Promise.resolve(),
    },
  }));

  ingestion.cleanIngest(validConfig)
    .then((result) => {
      assert.ok(result, 'promise should resolve');
    });
});
