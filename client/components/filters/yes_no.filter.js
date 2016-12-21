'use strict';

angular.module('wellness').filter('yesNo', function() {
  return function(value) {
    return Boolean(value) ? 'Yes' : 'No';
  };
});
