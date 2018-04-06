const test = require('tape').test;
const rewire = require('rewire');
const ingestLib = rewire('../../lib');

ingestLib.__set__('elasticsearch', {
  Client: function (settingsObject) {
    this.hostName = settingsObject.host;
  },
});

test('getClient function', assert => {
  assert.equal(typeof ingestLib.getClient, 'function', ' should exist');
  assert.end();
});

test('getClient function', assert => {
  let client = ingestLib.getClient('test.com:9200');
  assert.equal(client.hostName, 'test.com:9200', ' should create a client');
  assert.end();
});

test('getDebugClient function', assert => {
  assert.equal(typeof ingestLib.getDebugClient, 'function', ' should exist');
  assert.end();
});

test('getDebugClient function', assert => {
  let client = ingestLib.getDebugClient('test.com:9200');
  assert.equal(client.hostName, 'test.com:9200', ' should create a client');
  assert.end();
});
