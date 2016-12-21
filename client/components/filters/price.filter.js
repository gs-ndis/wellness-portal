'use strict';

angular.module('wellness').filter('price', function() {
  return function(price, precision) {
    if (isNaN(parseFloat(price)) || !isFinite(price)) {
      return '-';
    }
    if (!price) {
      return 0;
    }
    if (typeof precision === 'undefined') {
      precision = 1;
    }
    if (price < 1000) {
      precision = 0;
    }
    var units = ['', 'k', 'M'];
    var number = Math.floor(Math.log(price) / Math.log(1000));
    return '$'+(price / Math.pow(1000, Math.floor(number))).toFixed(precision) + '&nbsp;' + units[number];
  };
});

