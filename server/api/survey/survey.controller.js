'use strict';

var _ = require('lodash');
var Survey = require('./survey.model');
var errorSender = require('../../util/errorSender');
var QueryBuilder = require('../../util/query.builder');

exports.index = function(req, res) {
  var queryBuilder = new QueryBuilder(req.query);

  queryBuilder.andString('variantId')
    .andString('description')
    .andListString('unit')
    .andNumber('supportItemId');

  var request = Survey.find(queryBuilder.getQuery())
    .skip(queryBuilder.skip)
    .limit(queryBuilder.limit)
    .sort('variantId')
    .exec();
  return Promise.props({data: request, count: Survey.count(queryBuilder.getQuery())})
    .then(function(data) {
      return res.json(data);
    }).bind(res).catch(errorSender.handlePromiseError);
};

exports.show = function(req, res) {
  if (!req.params.id) {
    throw errorSender.statusError(422);
  }
  Survey.findById(req.params.id)
    .then(function(variant) {
      if (!variant) {
        throw errorSender.statusError(404);
      }
      return res.json(variant);
    }).bind(res).catch(errorSender.handlePromiseError);
};

exports.create = function(req, res) {
  var variant = new Survey(req.body);
  variant._user = req.user._id;
  variant.source = 'manual';
  variant.save().then(function(variant) {
    return res.json(201, variant);
  }).catch(function(err) {
    if (err.name === 'MongoError' && err.code === 11000) {
      return res.json(422, {success: false, message: 'Variant with ID "' + req.body.variantId + '" already exists!'});
    }
    throw err;
  }).bind(res).catch(errorSender.handlePromiseError);
};

exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Survey.findById(req.params.id).then(function(variant) {
    if (!variant) {
      throw errorSender.statusError(404, 'NotFound');
    }
    _.extend(variant, req.body);
    return variant.save();
  }).then(function(supportItem) {
    return res.json(200, supportItem);
  }).catch(function(err) {
    if (err.name === 'MongoError' && err.code === 11000) {
      return res.json(422, {success: false, message: 'Survey with ID "' + req.body.variantId + '" already exists!'});
    }
    throw err;
  }).bind(res).catch(errorSender.handlePromiseError);
};

exports.destroy = function(req, res) {
  Survey.findById(req.params.id).then(function(variant) {
    if (!variant) {
      throw errorSender.statusError(404);
    }
    return variant.remove();
  }).then(function() {
    return res.send(204);
  }).bind(res).catch(errorSender.handlePromiseError);
};