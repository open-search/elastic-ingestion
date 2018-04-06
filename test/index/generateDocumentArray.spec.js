const rewire = require('rewire');
let ingestion = rewire('../..');
const test = require('tape').test;
let fsMock = {
  readFile: (path, callback) => {
    callback(null, Buffer.from('datadatadatadata', 'base64'));
  },
};
let documentObject = {
  indextype: [
    {
      lastSaveDate: '2015-06-10',
      download: '/files/Season four episode eight.pdf',
      file: 'Season four episode eight.pdf',
      title: 'Season four episode eight.pdf',
    },
    {
      lastSaveDate: '2015-05-10',
      download: '/files/Season four episode eleven.pdf',
      file: 'Season four episode eleven.pdf',
      title: 'Season four episode eleven.pdf',
    },
    {
      lastSaveDate: '2011-05-10',
      download: '/files/Season four episode five.pdf',
      file: 'Season four episode five.pdf',
      title: 'Season four episode five.pdf',
    },
  ],
};

let firstDocumentElement = { lastSaveDate: '2015-06-10',
  download: '/files/Season four episode eight.pdf',
  file: 'Season four episode eight.pdf',
  title: 'Season four episode eight.pdf',
  data: 'datadatadatadata', };

ingestion.__set__('fs', fsMock);

test('generateDocumentArray function', assert => {
  assert.plan(4);
  ingestion.generateDocumentArray('testindex', documentObject)
    .then(result => {
      assert.equals(Array.isArray(result), true, 'should return an array');
      assert.equals(result.length, 3, 'should have correct number of elements');
      assert.same(result[0][0], { index: { _index: 'testindex', _type: 'indextype' } },
        'should include correct index object');
      assert.same(result[0][1], firstDocumentElement, 'should include correct document object');
    });
});
