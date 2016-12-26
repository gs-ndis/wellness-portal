'use strict';

var express = require('express');
var controller = require('./result.controller');
var auth = require('../../auth/auth.service');
var config = require('../../config/environment');
var recaptcha = require('express-recaptcha');
recaptcha.init(config.recaptchaSiteKey, config.recaptchaSecretKey);

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/my', auth.attachUUID(), controller.myResults);
router.get('/:id', auth.attachUUID(), controller.show);
router.post('/', auth.attachUUID(), recaptcha.middleware.verify, controller.create);
router.post('/:id', auth.hasRole('admin'), controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
