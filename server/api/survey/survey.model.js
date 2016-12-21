'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SurveySchema = new Schema({
  variantId: {type: String, unique: true, required: true, dropDups: true},
  description: String,
  unit: String,
  validFrom: Date,
  price: Number,
  priceCap: [{location: [], price: Number, _id: false}],
  locations: [],
  attributes: {},
  supportItemId: Number
});

module.exports = mongoose.model('Survey', SurveySchema);
