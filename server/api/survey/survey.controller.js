'use strict';

var _ = require('lodash');
var Survey = require('./survey.model');
var errorSender = require('../../util/errorSender');
var QueryBuilder = require('../../util/query.builder');

exports.index = function(req, res) {
  var queryBuilder = new QueryBuilder(req.query);

  queryBuilder.andString('title')
    .andString('description');

  var request = Survey.find(queryBuilder.getQuery())
    .skip(queryBuilder.skip)
    .limit(queryBuilder.limit)
    .sort('_id')
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
    .then(function(survey) {
      if (!survey) {
        throw errorSender.statusError(404);
      }
      return res.json(survey);
    }).bind(res).catch(errorSender.handlePromiseError);
};

exports.create = function(req, res) {
  var survey = new Survey(req.body);
  survey._user = req.user._id;
  survey.save().then(function(variant) {
    return res.json(201, variant);
  }).bind(res).catch(errorSender.handlePromiseError);
};

exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Survey.findById(req.params.id).then(function(survey) {
    if (!survey) {
      throw errorSender.statusError(404, 'NotFound');
    }
    _.extend(survey, req.body);
    return survey.save();
  }).then(function(survey) {
    return res.json(200, survey);
  }).bind(res).catch(errorSender.handlePromiseError);
};

exports.destroy = function(req, res) {
  Survey.findById(req.params.id).then(function(survey) {
    if (!survey) {
      throw errorSender.statusError(404);
    }
    return survey.remove();
  }).then(function() {
    return res.send(204);
  }).bind(res).catch(errorSender.handlePromiseError);
};