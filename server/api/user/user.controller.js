'use strict';

var User = require('./user.model');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var helper = require('../../util/helper');
var _ = require('lodash');
var Promise = require('bluebird');
var ShortURL = require('../shortUrl/shortUrl.model');
var Role = require('../role/role.model');

var errorSender = require('../../util/errorSender');

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Build query with search filters
 * @param {Object} query object, will be extended and will be used as filter
 * @param {Object} searchData Object sended from st-table, contains search params
 * @return {Object} extended query object
 */
function addSearchFilters(query, searchData) {
  query.$and = query.$and || [];

  if (searchData.name) {
    query.$and.push({'name': helper.wrapRegExp(searchData.name)});
  }
  if (searchData.email) {
    query.$and.push({'email': helper.wrapRegExp(searchData.email)});
  }
  if (searchData.active && searchData.active.matchAny && !searchData.active.matchAny.all && searchData.active.matchAny.items && searchData.active.matchAny.items.length) {
    var $orActive = [];
    _.each(searchData.active.matchAny.items, function(item) {
      if (item) {
        $orActive.push({active: true});
      } else {
        $orActive.push({active: false});
        $orActive.push({active: {$exists: false}});
      }
    });
    if ($orActive.length) {
      query.$and.push({$or: $orActive});
    }
  }
  if (searchData.role && searchData.role.matchAny && !searchData.role.matchAny.all && searchData.role.matchAny.items && searchData.role.matchAny.items.length) {
    query.$and.push({role: {$in: searchData.role.matchAny.items}});
  }
  if (!query.$and.length) {
    delete query.$and;
  }
  return query;
}

/**
 * Get list of users
 * restriction: 'manager'
 */
exports.index = function(req, res) {
  var query = {};
  var filterSearch = {};
  var filter = {};
  if (req.query.filterSearch) {
    filterSearch = JSON.parse(req.query.filterSearch);
    if (filterSearch && filterSearch.predicateObject) {
      filter = addSearchFilters(filter, filterSearch.predicateObject);
    }
  }
  if (req.query.search) {
    if (!filter.$or) {
      filter.$or = [];
    }
    filter.$or.push({name: helper.wrapRegExp(req.query.search)});
    filter.$or.push({email: helper.wrapRegExp(req.query.search)});
  }
  if (req.query.role) {
    if (_.isArray(req.query.role)) {
      filter.role = {$in: req.query.role};
    } else {
      filter.role = req.query.role;
    }
  }
  var skip = req.query.start || 0;
  var limit = req.query.number || 10;
  if (limit < 0) {
    limit = undefined;
  }
  var select = '-salt -hashedPassword';
  if (req.query.profile) {
    select = 'name email role';
  }
  if (req.user.role === 'manager') {
    if (!filter.$and) {
      filter.$and = [];
    }
    filter.$and.push({$or: [{_manager: req.user._id}, {_id: req.user._id}]});
  }

  User.find(filter, select)
    .populate('_role', 'name')
    .skip(skip)
    .limit(limit)
    .exec(function(err, users) {
      if (err) {
        return errorSender.sendAndLog(res, 500, err);
      }
      User.count(filter, function(err, count) {
        if (err) {
          return errorSender.sendAndLog(res, 500, err);
        }
        res.json({data: users, count: count});
      });
    });
};

/**
 * Creates a new user
 */
exports.create = function(req, res) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) {
      return validationError(res, err);
    }
    var token = jwt.sign({_id: user._id}, config.secrets.session, config.loginTimeout);
    res.json({token: token});
  });
};

exports.signup = function(req, res) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.active = false;
  newUser.save(function(err, user) {
    if (err) {
      return validationError(res, err);
    }
    var token = jwt.sign({_id: user._id}, config.secrets.session, config.loginTimeout);
    res.json({token: token});
  });
};

exports.checkSignupToken = function(req, res) {

  if (req.body.userId) {
    var userId = jwt.verify(req.body.userId, config.secrets.callbackRegistration);
    User.findById(userId, 'name email phone').then(function(user) {
      if (!user) {
        res.send(404, 'user not found');
      }
      res.json(user);
    }).catch(function(err) {
      console.log(err);
      return validationError(res, err);
    });
  } else {
    res.send(200);
  }
};

/**
 * Get a single user
 */
exports.show = function(req, res, next) {
  var userId = req.params.id;

  User.findById(userId, '-salt -hashedPassword', function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return errorSender.sendAndLog(res, 401);
    }

    return res.json(user);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if (err) {
      return errorSender.sendAndLog(res, 500, err);
    }
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function(err, user) {
    if (user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) {
          return validationError(res, err);
        }
        res.send(200);
      });
    } else {
      errorSender.sendAndLog(res, 403);
    }
  });
};

var populateUserPermisssions = Promise.method(function(user, req) {
  if (!user) {
    throw 'User is not defined';
  }

  return  user.populate('_role').execPopulate().then(function(populated) {
    if (user.role !== 'contact') {
      user.permissions = Role.presets[user.role] || {};
    }
    user.remoteAddress = req.ip.replace(/::ffff:/, '');
    return user;
  });
});

/**
 * Update user
 */
exports.updateCurrentUser = function(req, res) {
  var userId = req.user._id;
  var email = String(req.body.email);
  var phone = String(req.body.phone);
  var name = String(req.body.name);

  User.findById(userId, function(err, user) {
    if (req.body.email) {
      user.email = email;
    }
    if (req.body.phone) {
      user.phone = phone;
    }
    if (req.body.name) {
      user.name = name;
    }
    var oldAddress;
    if (req.body.address) {
      oldAddress = user.address;
      user.address = req.body.address;
    }


    user.save(function(err) {
      if (err) {
        return validationError(res, err);
      }
      res.json(user);
    }).catch(function(err) {
      validationError(res, err);
    });
  });
};

exports.update = function(req, res) {
  var userId = req.params.id;
  delete req.body._id;
  delete req.body.__v;
  User.findById(userId, function(err, user) {
    _.extend(user, req.body);
    return user.save(function(err) {
      if (err) {
        return validationError(res, err);
      }
      res.send(200);
    });
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword')
    .populate('_role')
    .populate('_contacts')
    .exec(function(err, user) { // don't ever give out the password or salt
      console.log(err);
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.json(401);
      }

      return User.update({_id: user._id}, {lastLogin: new Date()}).then(function() {
        return populateUserPermisssions(user, req)
          .then(function(user) {
            res.json(user);
          });
      });
    })
    .catch(function(err) {
      validationError(res, err);
    });
};

function getShortUrlResetPassword(user, callback) {
  console.log(user._id);
  ShortURL.remove({'data.reset': true, 'data._id': user._id}, function(err) {
    if (err) {
      console.log(err);
    }
    var token = jwt.sign({id: user._id}, config.signupSessionSecret, {expiresIn: '24h'});
    console.log(token, {id: user._id});
    var shortUrl = new ShortURL({
      URL: '/reset/' + token,
      data: {reset: true, _id: user._id}
    });
    shortUrl.save(callback);
  });
}

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};


exports.getFrontendInfo = function(req, res) {

  User.findOne({reference: req.params.reference}).populate('_role').exec().then(function(user) {

    if (!user) {
      res.send(404, 'Not Found');
    }

    if (user.role !== 'contact') {
      user.permissions = Role.presets[user.role] || {};
    }

    if (_.get(user, 'permissions.userSettings.frontendReference.view') && user.name && user.phone && user.address) {
      res.json(200, {name: user.name, phone: user.phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'), address: helper.formatAddress(user.address)});
    } else {
      res.send(422, 'Unavaliable.');
    }

  }).catch(function(err) {
    console.log(err);
    validationError(res, err);
  });
};

exports.activate = function(req, res) {
  var userId = jwt.verify(req.body._id, config.secrets.callbackRegistration);
  User.findById(userId).then(function(user) {
    _.extend(user, {
      password: req.body.password,
      phone: req.body.phone,
      active: true,
      provider: 'local',
      role: 'user'
    });
    return user.save();
  }).then(function(saved) {
    var token = jwt.sign({_id: saved._id}, config.secrets.session, config.loginTimeout);
    res.json({token: token});
  }).catch(function(err) {
    validationError(res, err);
  });
};
