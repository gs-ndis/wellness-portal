'use strict';

var config = require('./environment');
var parseDbUrl = require('parse-database-url');

var options = parseDbUrl(config.mongo.uri);
options.driver = 'mongodb';
module.exports.options = options;
module.exports = {
  'defaultEnv': 'development',
  'development': options
};

