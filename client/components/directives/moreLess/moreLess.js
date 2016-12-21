'use strict';

angular.module('wellness').directive('moreLess', [function() {
    return {
      restrict: 'E',
      scope: {
        max: '=',
        text: '='
      },
      templateUrl: 'components/directives/moreLess/moreLess.html',
      link: function(scope) {
        scope.text = scope.text || '';
        scope.max = scope.max || 300;
        scope.isChopped = scope.text.length >= scope.max;
      }
    };
  }
]);
