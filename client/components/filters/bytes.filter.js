'use strict';

angular.module('wellness').filter('bytes', function() {
  return function(bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
      return '-';
    }
    if (!bytes) {
      return 0;
    }
    if (typeof precision === 'undefined') {
      precision = 1;
    }
    if (bytes < 1024) {
      precision = 0;
    }
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
    var number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
  };
});

