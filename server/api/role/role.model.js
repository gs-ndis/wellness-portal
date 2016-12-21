'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var _ = require('lodash');

var RoleSchema = new Schema({
  _user: {type: Schema.Types.ObjectId, ref: 'User'},
  name: String,
  description: String,
  permissions: Schema.Types.Mixed,
  isShare: Boolean,
  settings: Schema.Types.Mixed,
  active: Boolean,
  protected: {type: Boolean, default: false},
  created: {
    type: Date,
    default: Date.now
  }
});

var resources = {
  pages: 'Pages',
  leadList: 'Lead List',
  leadDetails: 'Lead Details',
  contactList: 'Contact List',
  userSettings: 'User Settings'
};

var permissions = {
  pages: {
    dashboard: {title: 'Dashboard', view: true},
    settings: {title: 'User Settings', view: true},
  }
};

var presets = {
  user: {
    pages: {
      dashboard: {view: true},
      settings: {view: true},
    }
  },
  manager: {},
  admin: {}
};

presets.manager = _.merge({}, presets.user);

_.each(resources, function(resource, key) {
  _.each(permissions[key], function(permission, permissionKey) {
    _.set(presets.admin, key + '.' + permissionKey, _.pick(permission, ['view', 'update', 'delete']));
  });
});

var model = mongoose.model('Role', RoleSchema);

model.presets = presets;
model.resources = resources;
model.permissions = permissions;

module.exports = model;
