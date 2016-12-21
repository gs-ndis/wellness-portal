/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var User = require('../api/user/user.model');
var _ = require('lodash');
var async = require('async');


User.count({}, function(err, count) {
  if (count) {
    return;
  }

  var user = new User({
    provider: 'local',
    name: 'Test User',
    email: 'test@test.com',
    password: 'test',
    active: true
  });

  user.save().then(function() {
    return new User({
      provider: 'local',
      role: 'admin',
      name: 'Admin',
      email: 'admin@admin.com',
      password: 'admin',
      active: true
    }).save();
  }).then(function() {
    console.log('finished populating users');
  });
});
