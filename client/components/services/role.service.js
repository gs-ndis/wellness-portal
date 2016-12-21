'use strict';

angular.module('wellness').factory('Role', function($resource) {
  return _.extend({}, $resource('/api/roles/:action/:_id', {_id: '@_id'}, {
    update: {
      method: 'PUT'
    },
    getPresets: {
      method: 'GET',
      params: {
        action: 'presets'
      }
    },
    defaults: {
      method: 'GET',
      params: {
        action: 'defaults'
      }
    }
  }), {
    toArray: function(role) {
      if (!role) {
        return {};
      }
      var result = {};
      _.each(role.permissions, function(perm, key) {
        _.set(result, key, perm);
      });
      return result;
    }
  });
});
