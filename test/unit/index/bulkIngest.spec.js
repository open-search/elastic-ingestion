'use strict';

let ingestion = require('../../../');
const test = require('tape').test;

test('bulkIngest function', assert => {

  assert.plan(1);

  let mockClient = {
    bulk: (ingestobject, callback) => {
      assert.deepEqual(ingestobject.body, [1, 2, 3], 'should decorate object with array');
    },
  };

  ingestion.bulkIngest(mockClient, [1, 2, 3]);

});

test('bulkIngest with valid results', assert => {

  assert.plan(1);

  let validClient = {
    bulk: (ingestobject, callback) => {
      callback(null, 'success');
    },
  };

  let validBulkIngest = ingestion.bulkIngest(validClient, []);
  validBulkIngest.then(result => {
    assert.equal(result, 'success', 'should be successful');
  });

});

test('bulkIngest with client error', assert => {

  assert.plan(1);

  let invalidClient = {
    bulk: (ingestobject, callback) => {
      callback({ message: 'some error' });
    },
  };

  let invalidBulkIngest = ingestion.bulkIngest(invalidClient, []);
  invalidBulkIngest.catch(error => {
    assert.equal(error, 'some error', 'should catch error');
  });

});
