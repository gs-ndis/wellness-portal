'use strict';

var express = require('express');
var controller = require('./shortUrl.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/:hash', controller.index);

module.exports = router;