'use strict';

const test = require('tape').test;
const ingest = require('../../../lib');

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
  assert.equal(typeof ingest.createIndex, 'function', 'should be a function');
  assert.end();
});

test('createIndex with valid values', assert => {
  assert.plan(1);
  ingest.createIndex(mockClient, 'testindex', { name: 'analyzer' })
    .then(result => {
      assert.equal(result, 'created', 'should create an index');
    });
});

test('createIndex with invalid values', assert => {
  assert.plan(1);
  ingest.createIndex(mockInvalidClient, 'testindex', {})
    .catch(result => {
      assert.equal(result, 'error', 'should reject');
    });
});
