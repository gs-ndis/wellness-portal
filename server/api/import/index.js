'use strict';

var express = require('express');
var controller = require('./import.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/updateLocal', controller.updateLocal);
router.get('/updateContentful', controller.updateContentful);

module.exports = router;