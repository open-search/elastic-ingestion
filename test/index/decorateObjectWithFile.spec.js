const rewire = require('rewire');
let ingestion = rewire('../..');
const test = require('tape').test;

test('decorateObjectWithFile with invalid path', assert => {
  assert.plan(1);

  let fsMock = {
    readFile: (path, callback) => {
      callback('some error');
    },
  };

  ingestion.__set__('fs', fsMock);
  ingestion
    .decorateObjectWithFile({}, 'invalidpath')
    .catch(error => {
      assert.equals(error, 'some error', 'should return an error');
    });

});

test('decorateObjectWithFile with valid params', assert => {
  assert.plan(3);

  let fsMock = {
    readFile: (path, callback) => {
      callback(null, Buffer.from('datadatadatadata', 'base64'));
    },
  };

  ingestion.__set__('fs', fsMock);
  ingestion
    .decorateObjectWithFile({ id: 'documentObject' }, 'validpath')
    .then(result => {
      assert.equal(typeof result, 'object', 'should return an object');
      assert.equal(typeof result.data, 'string', 'should have a data string');
      assert.equal(result.data, 'datadatadatadata', 'should decorate documentObject');
    });

});
