'use strict';

angular.module('wellness').factory('Settings', function($resource) {
  return $resource('/api/settings/:action', {}, {
    update: {
      method: 'PUT'
    },
    sample: {
      method: 'GET',
      params: {
        action: 'sample'
      }
    },
    additionalSettings: {
      method: 'GET',
      params: {
        action: 'additional'
      }
    },
    recreateSingupUrl: {
      method: 'GET',
      params: {
        action: 'recreateSignupUrl'
      }
    }
  });
});



