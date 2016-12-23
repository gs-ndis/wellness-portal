'use strict';

angular.module('wellness').controller('SurveyBlockEditColumnsDialogCtrl', function($scope, $modalInstance, $timeout, data) {
  $scope.block = data.block;

  $scope.cancel = function() {
    $modalInstance.dismiss();
  };

  $scope.resetScore = function() {
    swal({
      title: 'Reset scores',
      text: 'You are about to reset all score values. You can specify the starting score value or leave blank for default(1)',
      type: 'input',
      inputPlaceholder: 'Starting score value',
      showCancelButton: true,
      confirmButtonColor: '#f0ad4e',
      confirmButtonText: 'Reset!',
      closeOnConfirm: false
    }, function(inputValue) {
      if (inputValue === false) {
        return false;
      }
      var start = Number(inputValue);
      if (inputValue === '') {
        start = 1;
//        swal.showInputError('You need to write something!');
//        return false;
      }

      if (_.isNaN(start)) {
        swal.showInputError('You need to write valid number');
        return false;
      }

      $timeout(function() {
        _.each($scope.block.columns, function(column, index) {
          column.score = start + index;
        });
        swal('Success', 'All score values have been reset!', 'success');
      });
    });
  };

  $scope.save = function() {
    if (!$scope.surveyBlockEditColumnsForm.$valid) {
      return;
    }
    if (!_.size($scope.block.columns)) {
      swal('', 'You should add at least one column before saving', 'warning');
      return;
    }
    $modalInstance.close($scope.block.columns);
  };
});
