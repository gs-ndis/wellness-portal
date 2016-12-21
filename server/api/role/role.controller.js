'use strict';

var _ = require('lodash');
var Role = require('./role.model');
var errorSender = require('../../util/errorSender');

// Get list of roles
exports.index = function(req, res) {
  var isShare = req.query.share;
  var query = {};
  if (isShare === 'true') {
    query.isShare = true;
  }
  Role.find(query, function(err, roles) {
    if (err) {
      return errorSender.handleError(res, err);
    }
    return res.json(200, roles);
  });
};

// Get a single role
exports.show = function(req, res) {
  Role.findById(req.params.id, function(err, role) {
    if (err) {
      return errorSender.handleError(res, err);
    }
    if (!role) {
      return errorSender.sendAndLog(res, 404);
    }
    return res.json(role);
  });
};

// Creates a new role in the DB.
exports.create = function(req, res) {
  var role = new Role(req.body);
//  role._user = req.user._id;
  role.save(function(err, role) {
    if (err) {
      return errorSender.handleError(res, err);
    }
    return res.json(201, role);
  });
};

// Updates an existing role in the DB.
exports.update = function(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Role.findById(req.params.id, function(err, role) {
    if (err) {
      return errorSender.handleError(res, err);
    }
    if (!role) {
      return errorSender.sendAndLog(res, 404);
    }
    var updated = _.merge(role, req.body);
    role.permissions = req.body.permissions;
    role.settings = req.body.settings;
    role.markModified('permissions');
    role.markModified('settings');
    updated.save(function(err) {
      if (err) {
        return errorSender.handleError(res, err);
      }
      return res.json(200, role);
    });
  });
};

// Deletes a role from the DB.
exports.destroy = function(req, res) {
  Role.findById(req.params.id, function(err, role) {
    if (err) {
      return errorSender.handleError(res, err);
    }
    if (!role || role.protected) {
      return errorSender.sendAndLog(res, 404);
    }
    role.remove(function(err) {
      if (err) {
        return errorSender.handleError(res, err);
      }
      return res.send(204);
    });
  });
};

exports.defaults = function(req, res) {
  res.send({
    resources: Role.resources,
    permissions: Role.permissions,
    presets: Role.presets
  });
};