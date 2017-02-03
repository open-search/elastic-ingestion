'use strict';

const test = require('tape').test;
const ingest = require('../../../lib');

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
  assert.equal(typeof ingest.deleteIndex, 'function', 'should be a function');
  assert.end();
});

test('deleteIndex with valid values', assert => {
  assert.plan(1);
  ingest.deleteIndex(mockClient, 'testindex')
    .then(result => {
      assert.equal(result, 'deleted', 'should delete an index');
    });
});

test('deleteIndex with invalid values', assert => {
  assert.plan(1);
  ingest.deleteIndex(mockInvalidClient, 'testindex')
    .then(result => {
      assert.equal(result, 'error', 'should delete an index');
    });
});
