'use strict';

const test = require('tape').test;
const ingest = require('../../../lib');

const mockClient = {
  indices: {
    get: searchObj => new Promise((resolve, reject) => {
      resolve({
        beep: {
          aliases: {},
        },
        boop: {
          aliases: {},
        },
        thisistheone: {
          aliases: {
            myalias: {},
          },
        },
        weewaahwoowah: {
          aliases: {},
        },
      });
    }),
  },
};

const mockInvalidClient = {
  indices: {
    get: searchObj => new Promise((resolve, reject) => {
      reject('Some error!');
    }),
  },
};

test('getAliasIndex function', assert => {
  assert.equal(typeof ingest.getAliasIndex, 'function', 'should be a function');
  assert.end();
});

test('getAliasIndex on valid client', assert => {

  assert.plan(2);

  ingest.getAliasIndex(mockClient, 'myalias')
    .then(result => {
      assert.equal(result, 'thisistheone', 'should return correct index');
    });

  ingest.getAliasIndex(mockClient, 'nonexistant')
    .then(result => {
      assert.equal(result, null, 'should return null when no index');
    });

});

test('getAliasIndex on invalid client', assert => {

  assert.plan(1);

  ingest.getAliasIndex(mockInvalidClient, 'myalias')
    .then()
    .catch(error => {
      assert.equal(error, 'Some error!', 'should return an error message');
    });

});
