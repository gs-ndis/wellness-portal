'use strict';

angular.module('wellness').factory('Survey', function($resource) {
  return $resource('/api/surveys/:action/:_id', {_id: '@_id'}, {
    query: {
      isArray: false
    },
    update: {
      method: 'PUT'
    }
  });
});
