'use strict';

var express = require('express');
var controller = require('./role.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('user'), controller.index);
router.get('/defaults', auth.hasRole('user'), controller.defaults);
router.get('/:id', auth.hasRole('admin'), controller.show);
router.post('/', auth.hasRole('admin'), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;