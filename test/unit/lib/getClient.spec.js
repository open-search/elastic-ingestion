'use strict';

const test = require('tape').test;
const rewire = require('rewire');
const ingest = rewire('../../../lib');

ingest.__set__('elasticsearch', {
  Client: function (settingsObject) {
    this.hostName = settingsObject.host;
  },
});

test('getClient function', assert => {
  assert.equal(typeof ingest.getClient, 'function', ' should exist');
  assert.end();
});

test('getClient function', assert => {
  let client = ingest.getClient('test.com:9200');
  assert.equal(client.hostName, 'test.com:9200', ' should create a client');
  assert.end();
});

test('getDebugClient function', assert => {
  assert.equal(typeof ingest.getDebugClient, 'function', ' should exist');
  assert.end();
});

test('getDebugClient function', assert => {
  let client = ingest.getDebugClient('test.com:9200');
  assert.equal(client.hostName, 'test.com:9200', ' should create a client');
  assert.end();
});
