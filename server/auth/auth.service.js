'use strict';

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var User = require('../api/user/user.model');
var validateJwt = expressJwt({secret: config.secrets.session});
var settings = require('../util/settings');
var _ = require('lodash');
var Role = require('../api/role/role.model');
var basicAuth = require('basic-auth');
var errorSender = require('../util/errorSender');
/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if (req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }
      validateJwt(req, res, next);
    })
    // Attach user to request
    .use(function(req, res, next) {
      User.findById(req.user._id, '-salt -hashedPassword')
        .exec(function(err, user) {
          if (err) {
            return next(err);
          }
          if (!user) {
            return errorSender.sendAndLog(res, 401);
          }

          req.user = user;
          next();
        });
    })
    .use(function(req, res, next) {
      if (req.user && !req.user.active) {
        res.json(423, req.user);
      } else {
        next();
      }
    });
}

/**
 * Attaches the user object to the request if authenticated
 */
function attachUser() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow access_token to be passed through query parameter as well
      if (req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer ' + req.query.access_token;
      }
      validateJwt(req, res, function() {
        next();
      });
    })
    // Attach user to request
    .use(function(req, res, next) {
      if (!req.user) {
        return next();
      }
      User.findById(req.user._id, '-salt -hashedPassword')
        .exec(function(err, user) {
          if (err) {
            return next(err);
          }
          if (!user) {
            return next();
          }

          req.user = user;
          next();
        });
    })
    .use(function(req, res, next) {
      if (req.user && !req.user.active) {
        res.json(423, req.user);
      } else {
        next();
      }
    });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 * @param {String} roleRequired
 */
function hasRole(roleRequired) {
  if (!roleRequired)
    throw new Error('Required role needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function(req, res, next) {
      if (req.user && config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        next();
      } else {
        errorSender.sendAndLog(res, 403);
      }
    });
}

function checkRoleExists(path) {
  return _.has(Role.presets.user, path);
}

function checkRequirements(req, path) {

  if (req.user && req.user.permissions && req.user.leadoverrides && req.user.leadoverrides.length && req.user.role !== 'admin') {
    var leadId = req.query.leadId || req.params.leadId || req.query.lead || req.params.lead || req.query.id || req.params.id;
    var leadoverride = _.find(req.user.leadoverrides, function(leadoveride) {
      return leadoveride._lead.toString() === leadId;
    });
    if (!leadoverride && _.get(req.user.permissions, path)) {
      return true;
    } else if (leadoverride && _.get(leadoverride._role.permissions, path)) {
      return true;
    }
  } else if (req.user && req.user.permissions && _.get(req.user.permissions, path)) {
    return true;
  }
  return false;
}

function meetsRequirements(req, res, next, path) {
  if (checkRequirements(req, path)) {
    return next();
  }
  return errorSender.sendAndLog(res, 403);
}

function hasAccess(accessPath) {
  if (!accessPath) {
    throw new Error('Required access needs to be set');
  }
  return compose()
    .use(isAuthenticated())
    .use(function(req, res, next) {
      return meetsRequirements(req, res, next, accessPath);
    });
}
function hasAnyAccess(accessPaths) {
  if (!accessPaths) {
    throw new Error('Required access needs to be set');
  }
  if (typeof accessPaths === 'string') {
    return hasAccess(accessPaths);
  }

  return compose()
    .use(isAuthenticated())
    .use(function(req, res, next) {
      var found = false;
      if (req.user && req.user.permissions) {
        found = _.find(accessPaths, function(path) {
          return _.get(req.user.permissions, path);
        });
      }

      if (req.user && req.user.permissions && req.user.leadoverrides && req.user.leadoverrides.length && req.user.role !== 'admin') {
        var leadId = req.query.leadId || req.params.leadId || req.query.lead || req.params.lead || req.query.id || req.params.id;
        var leadoverride = _.find(req.user.leadoverrides, function(leadoveride) {
          return leadoveride._lead.toString() === leadId;
        });
        if (!leadoverride && _.get(req.user.permissions, found)) {
          return next();
        } else if (leadoverride && _.find(accessPaths, function(path) {
          return _.get(leadoverride._role.permissions, path);
        })) {
          return next();
        }
      } else if (req.user && req.user.permissions && _.get(req.user.permissions, found)) {
        return next();
      }
      return errorSender.sendAndLog(res, 403);

    });
}

function hasResourceAccess(resource) {
  if (!resource)
    throw new Error('Required access needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function(req, res, next) {
      var found = false;
      if (req.user && req.user.permissions) {
        found = _.find(req.user.permissions[resource], function(details) {
          return details.view || details.update || details.delete;
        });
      }
      if (found) {
        next();
      } else {
        errorSender.sendAndLog(res, 403);
      }
    });
}

function hasSignupToken() {
  return compose()
    // Validate jwt
    .use(function(req, res, next) {
      // allow token to be passed through query parameter as well
      if (req.query && req.query.hasOwnProperty('token')) {
        req.headers.token = req.query.token;
      }
      if (!req.headers.token) {
        return errorSender.sendAndLog(res, 403, {message: 'Signup token is missing'});
      }
      var result = {};
      try {
        result = jwt.verify(req.headers.token, config.signupSessionSecret);
      } catch (e) {
        return errorSender.sendAndLog(res, 403, {message: 'Signup token is invalid'});
      }
      if (result && result.key === settings.get('signupSecretKey')) {
        next();
      } else {
        errorSender.sendAndLog(res, 403, {message: 'Signup token is invalid'});
      }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
  return jwt.sign({_id: id}, config.secrets.session, {expiresIn: config.loginTimeout * 60});
}

function signContactToken(id) {
  return jwt.sign({_id: id, type: 'contact'}, config.secrets.session, {expiresIn: config.loginTimeout * 60});
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) {
    return res.json(404, {message: 'Something went wrong, please try again.'});
  }
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}



var basicAuthMiddlevare = function(req, res, next) {
  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  }

  return compose()
    .use(function(req, res, next) {
      var user = basicAuth(req);

      if (!user || !user.name || !user.pass) {
        return unauthorized(res);
      }

      if (user.name === config.basicAuth.user && user.pass === config.basicAuth.password) {
        return next();
      } else {
        return unauthorized(res);
      }
    });
};

exports.isAuthenticated = isAuthenticated;
exports.attachUser = attachUser;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.signContactToken = signContactToken;
exports.setTokenCookie = setTokenCookie;
exports.hasSignupToken = hasSignupToken;
exports.hasAccess = hasAccess;
exports.hasAnyAccess = hasAnyAccess;
exports.hasResourceAccess = hasResourceAccess;
exports.basicAuth = basicAuthMiddlevare;
exports.checkRequirements = checkRequirements;
exports.checkRoleExists = checkRoleExists;