'use strict';

angular.module('wellness').controller('SurveyEditResultsDialogCtrl', function($scope, $modalInstance, data) {
  $scope.survey = data.survey;
  if (!$scope.survey.results || !$scope.survey.results.length) {
    $scope.survey.results = [{}];
  }
  $scope.cancel = function() {
    $modalInstance.dismiss();
  };

  $scope.save = function() {
    if (!$scope.surveyEditResultsForm.$valid) {
      return;
    }
    $modalInstance.close($scope.survey.results);
  };
});
