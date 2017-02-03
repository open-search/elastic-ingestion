'use strict';

const test = require('tape').test;
const ingest = require('../../../lib');

const mockClient = {
  ingest: {
    getPipeline: () => new Promise((resolve, reject) => {
      resolve('getpiplinecalled');
    }),
    putPipeline: () => new Promise((resolve, reject) => {
      resolve('putpipelinecalled');
    }),
  },
};

test('getPipeline with name and no body', assert => {

  assert.plan(1);

  ingest
    .getPipeline(mockClient, { name: 'mytest' })
    .then(result => {
      assert.equal(result, 'mytest', 'should return name');
    });

});

test('getPipeline with name and body', assert => {

  assert.plan(1);

  ingest
    .getPipeline(mockClient, { name: 'mytest', body: {} })
    .then(result => {
      assert.equal(result, 'putpipelinecalled', 'should return putpipeline');
    });

});
