const test = require('tape').test;
const rewire = require('rewire');
const ingestLib = rewire('../../lib');

const mockClient = {
  indices: {
    create: () => new Promise((resolve, reject) => {
      resolve('created');
    }),
  },
};

const mockInvalidClient = {
  indices: {
    create: () => new Promise((resolve, reject) => {
      reject('error');
    }),
  },
};

test('createIndex', assert => {
  assert.equal(typeof ingestLib.createIndex, 'function', 'should be a function');
  assert.end();
});

test('createIndex with valid values', (assert) => {
  assert.plan(1);
  ingestLib.createIndex(mockClient, 'testindex', { name: 'analyzer' })
    .then((result) => {
      assert.equal(result, 'created', 'should create an index');
    });
});

test('createIndex with invalid values', assert => {
  assert.plan(1);
  ingestLib.createIndex(mockInvalidClient, 'testindex', {})
    .catch(result => {
      assert.equal(result, 'error', 'should reject');
    });
});
