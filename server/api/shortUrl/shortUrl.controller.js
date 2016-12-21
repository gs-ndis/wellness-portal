'use strict';

var _ = require('lodash');
var ShortURL = require('./shortUrl.model');
var async = require('async');
var errorSender = require('../../util/errorSender');
var jwt = require('jsonwebtoken');
var config = require('../../config/environment/');
var settings = require('../../util/settings');

var Buyer = require('../buyer/buyer.model');
var Contact = require('../contact/contact.model');
var User = require('../user/user.model');
var Email = require('../../util/email');
var EmailTemplate = require('../../util/emailTemplate');

exports.index = function(req, res) {
  ShortURL.findOne({hash: req.params.hash}, function(err, shortUrl) {
    if (err) {
      return errorSender.handleError(res, err);
    }
    if (!shortUrl || !shortUrl.URL) {
      return errorSender.sendAndLog(res, 404);
    }
    var url = shortUrl.URL;
    if (req.query && req.query !== {}) {
      var parts = _.map(req.query, function(val, key) {
        return key + '=' + val;
      }).join('&');

      url = url + '?' + parts;
    }
    console.log('ShortURL redirect url', url);
    res.redirect(url);
  });
};


