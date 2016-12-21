var config = require('../config/environment');
var _ = require('lodash');


function notify(err) {
  if (err && err.stack) {
    console.error(err.stack);
  } else {
    console.error(err);
  }
}

function getRequestParamsData(req) {
  if (!req) {
    return {};
  }
  var result = {};
  if (req.user && req.user._id) {
    result.user = _.pick(req.user, ['_id', 'name', 'email']);
  }
  result.method = req.method;
  result.params = req.params;
  result.query = req.query;
  result.body = req.body;
  result.headers = _.omit(req.headers, ['cookie', 'authorization']);
  result.path = req.url;
  result.url = 'http://' + config.domain + req.url;
  return result;
}

function handlePromiseError(err) {
  var status = 500;
  if (err.status) {
    status = err.status;
  }
  console.error(err);
  if (err && err.trace) {
    console.log(err.trace);
  }

  if (status !== 422 && status > 400) {// ignore 422 validation errors
    if (this) {
      var data = getRequestParamsData(this.req);
      err.url = data.url;
      err.params = data;
    }
    notify(err);
  }
  this && _.isFunction(this.send) && this.send(status, err.message || err);//jshint ignore:line
}

exports.handlePromiseErrorUnprocessable = function(err) {
  var status = 422;
  console.error(err);
  if (err && err.trace) {
    console.log(err.trace);
  }
  if (this) {
    var data = getRequestParamsData(this.req);
    err.url = data.url;
    err.params = data;
  }

  this && _.isFunction(this.send) && this.send(status, err.message || err);//jshint ignore:line
};

exports.handleError = function(res, err) {
  notify(err);
  return res.send(500, err);
};

exports.sendAndLog = function(res, status, message) {
  var messageString = message;
  if (typeof message === 'object') {
    try {
      messageString = JSON.stringify(message);
    } catch (err) {
      console.log('parse error', err);
    }
  }

  if (status !== 404) { // ignore 404  errors
    var err = new Error(status + ' ' + (messageString || ''));
    var data = getRequestParamsData(res.req);
    err.url = data.url;
    err.params = data;
    notify(err);
  }
  return res.send(status, message);
};

exports.statusError = function(status, message) {
  var error = new Error(message);
  error.status = status;
  if (!message) {
    switch (status) {
      case 404:
        error.message = 'Not found';
        break;
      case 422:
        error.message = 'Unprocessable Entity';
        break;
      case 403:
        error.message = 'Access denied';
        break;
      default :
        break;
    }
  }
  return error;
};

exports.handlePromiseError = handlePromiseError;

