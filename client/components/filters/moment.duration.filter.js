'use strict';
/* global moment */

angular.module('wellness').filter('duration', function() {
  return function(value, precision) {
    precision = precision || 0;
    return moment.duration(parseInt(value), 'seconds').format('h [hours] m [mins] s [secs]');
  };
});
