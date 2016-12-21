'use strict';

angular.module('wellness').factory('Permissions', function(Auth, $rootScope) {
  return {
    hasAccess: function() {
      if (!$rootScope.currentUser) {
        return false;
      }
      console.log('----------', $rootScope.currentUser._roleGroup);
      
      return true;
    }
  };
});
