'use strict';

angular.module('wellness').controller('SurveyBlockEditRowsDialogCtrl', function($scope, $modalInstance, data) {
  $scope.block = data.block;

  $scope.cancel = function() {
    $modalInstance.dismiss();
  };

  $scope.save = function() {
    if (!$scope.surveyBlockEditRowsForm.$valid) {
      return;
    }
    $modalInstance.close($scope.block.rows);
  };
});
