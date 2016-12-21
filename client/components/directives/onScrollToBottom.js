'use strict';

angular.module('wellness').directive('onScrollToBottom', function() {
  return {
    restrict: 'A',
    scope: {
      onScrollToBottom: '&'
    },
    link: function(scope, element) {
      var handler = scope.onScrollToBottom || angular.noop;
      element.bind('scroll', function() {
        if ((this.scrollHeight - (this.scrollTop + 300)) <= this.offsetHeight) {
          scope.$apply(handler);
        }
      });
    }
  };
});
