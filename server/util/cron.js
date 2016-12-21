'use strict';

var CronJob = require('cron').CronJob;
var Agenda = require('agenda');
var config = require('../config/environment');
var Promise = require('bluebird');
var contentfulClient = require('./contentful.client');

function initScheduler() {
  var agenda = new Agenda({db: {address: config.mongo.uri}});
  config.agenda = agenda;
  agenda.on('ready', function() {
    agenda.start();
  });

  exports.agenda = agenda;
}


function refreshContentfulCache() {
  var job = new CronJob({
    cronTime: config.cron.refreshContentfulCache,
    onTick: function() {
      contentfulClient.refreshCache();
    },
    start: true,
    runOnInit: false
  });
}


function init() {
//  refreshContentfulCache();
  initScheduler();
}

exports.init = init;