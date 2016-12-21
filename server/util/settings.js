'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('lodash');

var settingsPath = path.normalize(__dirname + '/../config/local.settings.json');
var sampleSettings = require(path.normalize(__dirname + '/../config/local.settings.sample.json'));
var settings = {};

function read() {
  try {
    settings = _.extend({}, sampleSettings, JSON.parse(fs.readFileSync(settingsPath, {encoding: 'utf8'})));
  } catch (e) {
    console.log(e);
    settings = _.extend({}, sampleSettings);
  }
  return _.extend({}, sampleSettings, settings);
}

function readSample() {
  return sampleSettings;
}

function save(data) {
  settings = _.extend({}, sampleSettings, data);
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

function get(name) {
  return settings[name];
}

read();

exports.get = get;
exports.read = read;
exports.readSample = readSample;
exports.save = save;
