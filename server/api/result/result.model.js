'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ResultSchema = new Schema({
  _user: {type: Schema.Types.ObjectId, ref: 'User'},
  _survey: {type: Schema.Types.ObjectId, ref: 'Survey'},
  result: {},
  score: Number,
  interpretation: {},
  uuid: String,
  created: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Result', ResultSchema);
