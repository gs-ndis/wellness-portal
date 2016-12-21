'use strict';

/**
 * AngularJS default filter with the following expression:
 * "person in people | filter: {name: $select.search, email: $select.search}"
 * performs a AND between 'name: $select.search' and 'email: $select.search'.
 * We want to perform a OR.
 */
angular.module('wellness').filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop] && item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };
});
