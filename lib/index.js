'use strict';

let elasticsearch = require('elasticsearch');

/**
* @param {string} host
* @return {object} elasticsearch client
*/
function getClient(host) {
  return __manageClients(host, {
    host: host,
  });
}

/**
* @param {string} host
* @return {object} elasticsearch client
*/
function getDebugClient(host) {
  return __manageClients(host, {
    host: host,
    log: 'trace',
  });
}

const __manageClients = (function () {

  let clients = {};

  return function (host, config) {

    if (!clients[host]) {
      clients[host] = new elasticsearch.Client(config);
    }

    return clients[host];

  };

}());

/**
 * Get or create a pipeline
 * @param {object} if no body, get pipeline from elastic, or create from object
 * @return {bool}
 */
function getPipeline(client, pipeline) {

  return new Promise((resolve, reject) => {

    if (typeof pipeline.body === 'object') {
      return client.ingest
        .putPipeline({ id: pipeline.name, body: pipeline.body })
        .then(resolve, reject);
    }

    resolve(pipeline.name);

  });

}

/**
 * Create an index with analyser and mapping analyzer
 * @param elasticsearch client {string}
 * @param index {string}
 * @param analyzer {object}
 * @return {promise}
 */
function createIndex(client, index, analyzer) {
  return client.indices.create({ index: index, body: JSON.stringify(analyzer) });
}

/**
 * Deletes an index
 * @param client (elasticsearch client)
 * @param index {string} elastic index to delete
 * @return {promise}
 */
function deleteIndex(client, index) {
  return new Promise((resolve, reject) => {
    client.indices
      .delete({ index: index })
      .then(resolve, resolve);
  });
}

/**
 * get the current index that is aliased
 * @param {object} client
 * @param {string} alias
 * @return {promise} fulfils string of index or null
 */
function getAliasIndex(client, alias) {
  return new Promise((resolve, reject) => {
    client.indices.get({ index: '_all' })
      .then(result => {
        for (let item in result) {
          if (alias in result[item].aliases) {
            return resolve(item);
          }
        }

        resolve(null);
      }, reject);
  });
}

module.exports = {
  getClient,
  getDebugClient,
  getPipeline,
  createIndex,
  deleteIndex,
  getAliasIndex,
};
