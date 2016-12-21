'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.hasRole('user'), controller.changePassword);
router.put('/me', auth.hasRole('user'), controller.updateCurrentUser);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.get('/:id', auth.hasRole('admin'), controller.show);
router.post('/', auth.hasRole('admin'), controller.create);
router.post('/signup', auth.hasSignupToken(), controller.signup);
router.post('/checkSignupToken', auth.hasSignupToken(), controller.checkSignupToken);

//router.post('/forgotPassword', controller.forgotPassword);
//router.post('/:id/resetPassword', auth.hasRole('admin'), controller.adminResetPassword);
//router.post('/resetPassword', controller.resetPassword);
router.post('/:id/activate', auth.hasSignupToken(), controller.activate);

module.exports = router;
