'use strict';

let ingestion = require('../../../');
const test = require('tape').test;

let validClient = {
  bulk: (ingestobject, callback) => {
    callback(null, 'success');
  },
};

let invalidClient = {
  bulk: (ingestobject, callback) => {
    callback({ message: 'some error' });
  },
};

test('bulkIngest function', assert => {

  assert.plan(1);

  let mockClient = {
    bulk: (ingestobject, callback) => {
      assert.deepEqual(ingestobject.body, [1, 2, 3], 'should decorate object with array');
    },
  };

  ingestion.bulkIngest(mockClient, [1, 2, 3]);

});

test('bulkIngest with empty object array', assert => {

  assert.plan(1);

  let validBulkIngest = ingestion.bulkIngest(validClient, []);
  validBulkIngest.then(result => {
    assert.deepEqual(result, [], 'should return empty array');
  });

});

test('bulkIngest with valid results', assert => {

  assert.plan(1);

  let validBulkIngest = ingestion.bulkIngest(validClient, ['test']);
  validBulkIngest.then(result => {
    assert.deepEqual(result, ['success'], 'should be successful');
  });

});

test('bulkIngest with client error', assert => {

  assert.plan(1);

  let invalidBulkIngest = ingestion.bulkIngest(invalidClient, ['test']);
  invalidBulkIngest.catch(error => {
    assert.deepEqual(error, 'some error', 'should catch error');
  });

});
