'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();
var errorSender = require('../../util/errorSender');

router.post('/', function(req, res, next) {

  passport.authenticate('local', function(err, user, info) {
    var error = err || info;
    if (error) {
      return errorSender.sendAndLog(res, 401, error);
    }
    if (!user) {
      return errorSender.sendAndLog(res, 404, {message: 'Something went wrong, please try again.'});
    }

    var token = auth.signToken(user._id, user.role);
    res.json({token: token});
  })(req, res, next);
});

module.exports = router;