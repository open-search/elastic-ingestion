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

test('indexIngest function with invalid config', (assert) => {
  assert.throws(() => { ingestion.indexIngest(); }, 'function', 'should throw');
  assert.end();
});

test('indexIngest function with error from lib', (assert) => {
  assert.plan(1);

  ingestion.__set__('lib.getClient', () => {
    throw new Error('Some error getting client');
  });

  ingestion.indexIngest(validConfig)
    .catch((error) => {
      assert.ok(error, 'promise should reject');
    });
});

test('indexIngest function with valid content', (assert) => {
  assert.plan(1);
  ingestion.__set__('lib.getClient', () => ({
    bulk: () => Promise.resolve(),
    indices: {
      delete: () => Promise.resolve(),
      create: () => Promise.resolve(),
    },
  }));
  ingestion.__set__('bulkIngest', () => Promise.resolve({ message: 'success' }));
  ingestion.__set__('lib.getPipeline', () => Promise.resolve());
  ingestion.__set__('generateDocumentArray', () => Promise.resolve([[1, 2, 3], [4, 5, 6]]));

  ingestion.indexIngest(validConfig)
    .then((result) => {
      assert.ok(result, 'promise should resolve');
    });
});
