'use strict';

angular.module('wellness').controller('AdminResultEditCtrl', function($scope, Result, $rootScope, $state, growl, $timeout, dialogs, $stateParams) {
  $scope.result = {};
  
  if ($stateParams.id) {
    $scope.result = Result.get({_id: $stateParams.id});
  } else {
    $scope.result = new Result($scope.result);
  }
  console.log($scope.result);
});
