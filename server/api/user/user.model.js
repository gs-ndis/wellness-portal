'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var authTypes = ['github', 'twitter', 'facebook', 'google', 'apikey', 'callback'];
var async = require('async');
var _ = require('lodash');

var UserSchema = new Schema({
  name: String,
  email: {type: String, lowercase: true},
  role: {
    type: String,
    default: 'user'
  },
  phone: String,
  hashedPassword: String,
  provider: String,
  salt: String,
  active: {type: Boolean, default: false},
  lastLogin: {type: Date},
  facebook: Schema.Types.Mixed,
  twitter: Schema.Types.Mixed,
  google: Schema.Types.Mixed,
  github: Schema.Types.Mixed,
  _role: {type: Schema.Types.ObjectId, ref: 'Role'},
  permissions: Schema.Types.Mixed,
  homepage: String,
  apikey: {type: String, unique: true, sparse: true},
  address: Schema.Types.Mixed
});

//UserSchema.index({'extension': 1}, {background: true, unique: true, partialFilterExpression: {extension: {$ne: null}}}, function(err, result) {
//  console.log(err, result);
//});


/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    if (authTypes.indexOf(this.provider) !== -1)
      return true;
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    if (authTypes.indexOf(this.provider) !== -1)
      return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    if (self.provider === 'apikey') {
      return respond(true);
    }
    this.constructor.findOne({email: value, provider: {$ne: 'apikey'}}, function(err, user) {
      if (err) {
        throw err;
      }
      if (user) {
        if (self.id === user.id) {
          return respond(true);
        }
        return respond(false);
      }
      respond(true);
    });
  }, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {
  var self = this;
  if (self.isNew) {

    if (!validatePresenceOf(self.hashedPassword) && authTypes.indexOf(self.provider) === -1) {
      return next(new Error('Invalid password'));
    } else {
      return next();
    }
  }
  next();
});

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },
  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },
  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt)
      return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  },
//  getUserIdsByRole: function() {
//    var ids = [];
//    if (this.role !== 'admin') {
//      ids.push(this._id);
//      if (this.role === 'manager' && this.sales.length) {
//        ids = ids.concat(this.sales);
//      }
//    }
//    return ids;
//  }
};

UserSchema.statics.getAdmins = function(cb) {
  return this.find({role: 'admin', active: true, email: {$ne: null}}, '-salt -hashedPassword', cb);
};

module.exports = mongoose.model('User', UserSchema);
