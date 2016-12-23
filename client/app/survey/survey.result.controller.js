'use strict';

angular.module('wellness').controller('SurveyResultCtrl', function($scope, $stateParams, $state, Result) {
  console.log('SurveyResultCtrl controller');
  Result.get({_id: $stateParams.id}, function(result) {
    $scope.result = result;
  });
});
