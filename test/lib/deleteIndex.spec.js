const test = require('tape').test;
const rewire = require('rewire');
const ingestLib = rewire('../../lib');

const mockClient = {
  indices: {
    delete: () => new Promise((resolve, reject) => {
      resolve('deleted');
    }),
  },
};

const mockInvalidClient = {
  indices: {
    delete: () => new Promise((resolve, reject) => {
      reject('error');
    }),
  },
};

test('deleteIndex', assert => {
  assert.equal(typeof ingestLib.deleteIndex, 'function', 'should be a function');
  assert.end();
});

test('deleteIndex with valid values', assert => {
  assert.plan(1);
  ingestLib.deleteIndex(mockClient, 'testindex')
    .then(result => {
      assert.equal(result, 'deleted', 'should delete an index');
    });
});

test('deleteIndex with invalid values', assert => {
  assert.plan(1);
  ingestLib.deleteIndex(mockInvalidClient, 'testindex')
    .then(result => {
      assert.equal(result, 'error', 'should delete an index');
    });
});
