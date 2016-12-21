'use strict';

angular.module('wellness').filter('address', function() {
  return function(address) {
    var result = '';
    if (address && _.isObject(address)) {
      var addressParts = [address.street, address.city, address.state];
      result = _.chain(addressParts).map(_.trim).compact().join(', ').value();

      var zip = _.trim(address.zip);
      if (!_.isEmpty(zip)) {
        result += ' ' + zip;
      }
    } else {
      result = address;
    }
    return _.trim(result);
  };
});

