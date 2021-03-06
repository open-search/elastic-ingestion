let fs = require('fs');
let path = require('path');
let lib = require('./lib');

/**
 * Establish if all fields exist in object based on fieldArray
 * @param {object} base object
 * @param {array} list of fields to validate
 * @return {bool}
 */
function fieldsExistInObject(object, fieldArray) {
  return fieldArray.reduce((curr, next) => {
    if (!curr) {
      return false;
    }

    return next in object;
  }, true);
}

function validateConfig(config) {
  if (!config ||
    !fieldsExistInObject(config, ['host', 'index'])) {
    throw new Error('You must pass a settings object.');
  }
}

function getBody(index, targetAlias, previousIndex) {
  const body = {
    body: {
      actions: [
        { add: { index, alias: targetAlias } },
      ],
    },
  };

  if (previousIndex) {
    body.body.actions.push({
      remove: { index: previousIndex, alias: targetAlias },
    });
  }

  return body;
}

/**
 * Read target attachment, convert to base64, and populate object
 * @param {object} documentObject the actual content to be ingested
 * @param {object} filePath the path of the file to read to decorate documentObject
 * @return {promise}
 */
function decorateObjectWithFile(documentObject, filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (error, data) => {
      if (error) {
        return reject(error);
      }

      return resolve(Object.assign(documentObject, { data: data.toString('base64') }));
    });
  });
}

/**
 * Generate array of documents to bulk ingest
 * @param {string} the name of the elasticsearch index
 * @param {object} documentObject
 */
function generateDocumentArray(index, documentObject) {
  return new Promise((resolve, reject) => {
    const documentPromiseArray = [];

    Object
      .keys(documentObject)
      .forEach((type) => {
        documentObject[type]
          .forEach((document) => {
            documentPromiseArray.push(
              decorateObjectWithFile(document, path.normalize(document.file))
                .then(resultObject => Promise.resolve([{
                  index: {
                    _index: index,
                    _type: type,
                  },
                }, resultObject])));
          });
      });

    Promise
      .all(documentPromiseArray)
      .then(resolve)
      .catch(reject);
  });
}

/**
 * Take a list of documents, and ingest them
 * @param {object} elastcicsearch client
 * @param {array} array of objects to ingest
 * @return {promise}
 */
function bulkIngest(client, documentArray) {
  const promises = [];
  const delta = 1000;

  for (let i = 0; i < documentArray.length; i += delta) {
    promises.push(new Promise((resolve, reject) => {
      client.bulk({
        body: documentArray.slice(i,
          (i + delta > documentArray.length ? documentArray.length : i + delta)),
        pipeline: 'attachment',
      }, (error, response) => {
        if (error) {
          return reject(error.message);
        }

        return resolve(response);
      });
    }));
  }

  return Promise.all(promises);
}

/**
 * cleanIngest - delete index with same name, replace with new. Optinally set an alias
 *
 * @param {object} config object. See example in readme.
 * @return {promise}
 *
 */
function cleanIngest(config) {
  validateConfig(config);

  return new Promise((resolve, reject) => {
    const client = lib.getClient(config.host);

    lib.deleteIndex(client, config.index)
      .then(() => {
        Promise.all([
          lib.createIndex(client, config.index, config.analyzer),
          lib.getPipeline(client, config.pipeline),
        ]).then(() => {
          generateDocumentArray(config.index, config.documentObject)
            .then((result) => {
              bulkIngest(client, result.reduce((curr, next) => curr.concat(next)))
                .then((response) => {
                  if (config.alias) {
                    return client.indices.putAlias({
                      name: config.alias,
                      index: [config.index],
                    }).then(() => resolve(true), reject);
                  }

                  return resolve(response);
                })
                .catch(reject);
            });
        });
      })
      .catch(reject);
  });
}

/**
 * Ingest into new index, update the alias to remove previous and use current
 *
 * @param {object} config object. See above example.
 * @return {promise}
 *
 */
function alias(config) {
  validateConfig(config);

  return new Promise((resolve, reject) => {
    const client = lib.getClient(config.host);
    const index = config.index;

    Promise.all([
      lib.createIndex(client, index, config.analyzer),
      lib.getPipeline(client, config.pipeline),
    ]).then(() => {
      generateDocumentArray(config.index, config.documentObject)
        .then((result) => {
          bulkIngest(client, result.reduce((curr, next) => curr.concat(next)))
            .then(() => {
              lib.getAliasIndex(client, config.alias)
                .then((previousIndex) => {
                  client.indices.updateAliases(getBody(index, config.alias, previousIndex))
                    .then(() => {
                      if (previousIndex) {
                        return lib.deleteIndex(client, previousIndex)
                          .then(() => resolve(true), reject);
                      }
                      return resolve(true);
                    }, reject);
                });
            }).catch(reject);
        });
    }).catch(reject);
  });
}

/**
 * Ingest into existing index
 *
 * @param {object} config object. See above example.
 * @return {promise}
 *
 */
function indexIngest(config) {
  validateConfig(config);
  return new Promise((resolve, reject) => {
    const client = lib.getClient(config.host);
    const index = config.index;  
    lib.getPipeline(client, config.pipeline)
      .then(() => {
        generateDocumentArray(index, config.documentObject)
          .then((result) => {
            bulkIngest(client, result.reduce((curr, next) => curr.concat(next)))
              .then(() => {
                resolve(true);
              }).catch(reject);
          });
      })
      .catch(reject);
  });
}

module.exports = {
  cleanIngest,
  alias,
  decorateObjectWithFile,
  generateDocumentArray,
  bulkIngest,
  fieldsExistInObject,
  indexIngest,
};
