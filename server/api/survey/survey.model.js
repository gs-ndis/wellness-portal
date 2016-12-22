'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SurveySchema = new Schema({
  _user: {type: Schema.Types.ObjectId, ref: 'User'},
  title: String,
  description: String,
  blocks: []
});

module.exports = mongoose.model('Survey', SurveySchema);
