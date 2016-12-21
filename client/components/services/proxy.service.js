'use strict';

angular.module('wellness').factory('Proxy', function($resource) {
  return $resource('/api/proxies/:action/:_id', {_id: '@_id'}, {
    update: {
      method: 'PUT'
    },
    import: {
      method: 'POST',
      params: {
        action: 'import'
      }
    }
  });
});
