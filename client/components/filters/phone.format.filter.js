'use strict';

var phoneRegex = /^1?(\d{3})(\d{3})(\d{4})$/;

angular.module('wellness').filter('phoneFormat', function() {
  return function(value) {
    var matches = (value + '').match(phoneRegex);
    if (!matches || matches.length <= 1) {
      return value;
    }
    return '+1 ' + matches[1] + '-' + matches[2] + '-' + matches[3];
  };
});
