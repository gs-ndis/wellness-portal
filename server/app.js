/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
//var mongoose = require('mongoose');
var config = require('./config/environment');
//var importLeads = require('./util/importLeads');
//var dbMigrate = require('db-migrate');
var path = require('path');
global.Promise = require('bluebird');
global._ = require('lodash');
//var MongoClient = require('mongodb').MongoClient;
//var migrateConfig = require('./config/migrate');



var promise = new Promise(function(resolve, reject) {
  resolve();
//
//
////run migrations
//  var migrationConfig = require('./config/migrate').development;
//  global.migrationTable = 'migrations';
//  global.matching = '';
//  global.mode = '';
//  dbMigrate.connect(migrationConfig, function(err, migrator) {
//    if (err) {
//      console.log('Cant init migration script', err);
//      return reject(err);
//    }
//    migrator.migrationsDir = path.resolve("server/migrations/");
//    migrator.driver.createMigrationsTable(function(err) {
//      if (err) {
//        console.log('Cant create migrations table:', err);
//        return reject(err);
//      }
//      migrator.up([], function(err) {
//        if (err) {
//          console.log('Migrate error:', err);
//          return reject(err);
//        }
//        migrator.driver.close(function(err) {
//          if (err) {
//            console.log('Cant close migrator driver', err);
//            return reject(err);
//          }
//          return resolve(err);
//        });
//      });
//    });
//  });
});

promise
  .then(function() {
    console.log('migration script return success result');
  }, function(err) {
    console.log('migration script return error:', err);
  })
  .finally(function() {

// Connect to database
//    mongoose.connect(config.mongo.uri, config.mongo.options, function() {
//      if (config.mongo.debug) {
//        mongoose.set('debug', true);
//      }
//      mongoose.Promise = require('bluebird');
      // Setup server
      var app = express();

      // Populate DB with sample data
      if (config.seedDB) {
        require('./config/seed');
      }
      var server = require('http').createServer(app);
      var socketio = require('socket.io')(server, {
        serveClient: (config.env === 'production') ? false : true,
        path: '/socket.io-client'
      });

      require('./config/socketio')(socketio);
      require('./config/express')(app);
      require('./routes')(app);
//      var cron = require('./util/cron');
//      cron.init();
      // Start server
      server.listen(config.port, config.ip, function() {
        console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
      });
      exports = module.exports = app;
//    });
  });
// Expose app
