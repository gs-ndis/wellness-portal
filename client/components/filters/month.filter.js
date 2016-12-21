'use strict';

angular.module('wellness').filter('months', function() {
  return function(value) {
    if (isNaN(parseFloat(value))) {
      return '-';
    }
    if (Math.floor(value) === 1) {
      return value + ' month';
    }
    return value + ' months';
  };
});

