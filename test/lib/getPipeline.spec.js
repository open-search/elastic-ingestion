const test = require('tape').test;
const rewire = require('rewire');

const ingestLib = rewire('../../lib');

const mockClient = {
  ingest: {
    getPipeline: () => new Promise((resolve) => {
      resolve('getpiplinecalled');
    }),
    putPipeline: () => new Promise((resolve) => {
      resolve('putpipelinecalled');
    }),
  },
};

test('getPipeline with name and no body', (assert) => {
  assert.plan(1);
  ingestLib
    .getPipeline(mockClient, { name: 'mytest' })
    .then((result) => {
      assert.equal(result, 'mytest', 'should return name');
    });
});

test('getPipeline with name and body', (assert) => {
  assert.plan(1);
  ingestLib
    .getPipeline(mockClient, { name: 'mytest', body: {} })
    .then((result) => {
      assert.equal(result, 'putpipelinecalled', 'should return putpipeline');
    });
});
