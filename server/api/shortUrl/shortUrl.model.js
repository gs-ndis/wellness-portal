'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortid = require('shortid');

var ShortURLSchema = new Schema({
  id: {type: Schema.Types.ObjectId},
  URL: {type: String, unique: false},
  hash: {type: String, unique: true, default: shortid.generate},
  hits: {type: Number, default: 0},
  data: {type: Schema.Types.Mixed},
  created: {type: Date, default: Date.now}
}, {
  versionKey: false
});

module.exports = mongoose.model('ShortURL', ShortURLSchema);
