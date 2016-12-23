'use strict';

angular.module('wellness').factory('Result', function($resource) {
  return $resource('/api/results/:action/:_id', {_id: '@_id'}, {
    query: {
      isArray: false
    },
    update: {
      method: 'PUT'
    }
  });
});
