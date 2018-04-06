let ingestion = require('../..');
const test = require('tape').test;

test('fieldsExistInObject', assert => {
  let testObject = {
    a: null,
    b: null,
    c: null,
    x: null,
    y: null,
    z: null,
  };
  assert.throws(() => { ingestion.fieldsExistInObject(); }, 'should throw with no parameters');
  assert.equals(ingestion.fieldsExistInObject(testObject,
    ['a', 'b', 'c']), true, 'should validate correct fields');
  assert.equals(ingestion.fieldsExistInObject(testObject,
    ['d', 'e', 'f']), false, 'should return false for missing fields');
  assert.end();
});
