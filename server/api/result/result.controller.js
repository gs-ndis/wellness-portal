'use strict';

var _ = require('lodash');
var Result = require('./result.model');
var Survey = require('../survey/survey.model');
var errorSender = require('../../util/errorSender');
var QueryBuilder = require('../../util/query.builder');

exports.index = function(req, res) {
  var queryBuilder = new QueryBuilder(req.query);

  queryBuilder.andString('title')
    .andString('description');

  var request = Result.find(queryBuilder.getQuery())
    .skip(queryBuilder.skip)
    .limit(queryBuilder.limit)
    .sort('-_id')
    .populate('_user')
    .exec();
  return Promise.props({data: request, count: Result.count(queryBuilder.getQuery())})
    .then(function(data) {
      return res.json(data);
    }).bind(res).catch(errorSender.handlePromiseError);
};

exports.myResults = function(req, res) {
  if (!req.uuid) {
    res.json(422, 'UUID is required');
    return;
  }
  return Result.find({uuid: req.uuid}).then(function(data) {
    return res.json(data);
  }).bind(res).catch(errorSender.handlePromiseError);
};

exports.show = function(req, res) {
  if (!req.params.id) {
    res.json(422, 'id is missing');
    return;
  }
  if (!req.uuid) {
    res.json(422, 'uuid is missing');
    return;
  }
  Result.findById(req.params.id)
    .then(function(result) {
      if (!result) {
        throw errorSender.statusError(404);
      }
//      if (req.user.id !== result.id && req.user.role !== 'admin') {
//        throw errorSender.statusError(403);
//      }

      return res.json(result);
    }).bind(res).catch(errorSender.handlePromiseError);
};

exports.create = function(req, res) {
  if (req.recaptcha.error) {
    res.json(422, {error: req.recaptcha.error, message: req.recaptcha.error});
    return;
  }
  var resultSurvey = req.body.survey;
  var result = new Result();
//  result._user = req.user._id;
  result._survey = req.body.survey._id;
  result.result = resultSurvey;
  result.uuid = req.uuid;
  var totalScore = 0;
  Survey.findOne({_id: resultSurvey._id}).then(function(survey) {
    if (!survey) {
      throw errorSender.statusError(404);
    }
    _.each(resultSurvey.blocks, function(block) {
      _.each(block.rows, function(row) {
        if (block.type === 'radio') {
          totalScore += row.value.score;
        } else if (block.type === 'checkbox') {
          _.each(row.value, function(column, key) {
            if (column) {
              totalScore += block.columns[Number(key)].score;
            }
          });
        }
      });
    });
    result.score = totalScore;
    var interpretation;

    _.each(survey.results, function(baseResult, index) {
      if (totalScore >= (baseResult.start || 0) && totalScore <= (baseResult.end || Number.MAX_VALUE)) {
        interpretation = baseResult;
      }
    });
    result.interpretation = interpretation;

    return result.save();
  }).then(function(result) {
    return res.json(201, result);
  }).bind(res).catch(errorSender.handlePromiseError);



};

exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Result.findById(req.params.id).then(function(survey) {
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
  Result.findById(req.params.id).then(function(survey) {
    if (!survey) {
      throw errorSender.statusError(404);
    }
    return survey.remove();
  }).then(function() {
    return res.send(204);
  }).bind(res).catch(errorSender.handlePromiseError);
};