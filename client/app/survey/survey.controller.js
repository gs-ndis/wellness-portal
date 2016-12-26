'use strict';

angular.module('wellness').controller('SurveyCtrl', function($rootScope, $scope, $stateParams, $state, Survey, Result) {
  console.log('SurveyCtrl controller');
  $scope.formData = {};
  Survey.get({_id: $stateParams.id}, function(result) {
    $scope.survey = result;
    $scope.totalQuestionCount = 0;
    _.each($scope.survey.blocks, function(block) {
      $scope.totalQuestionCount += block.rows.length;
    });
  });

  $scope.$watch('survey', function() {
    $scope.filledCount = 0;
    console.log('watch');
    if (!$scope.survey || !$scope.survey.blocks) {
      return;
    }
    console.log('watch ...');

    _.each($scope.survey.blocks, function(block) {
      _.each(block.rows, function(row) {
        if (block.type === 'radio') {
          if (row.value) {
            $scope.filledCount++;
            row.filled = true;
          } else {
            row.filled = false;
          }
        } else if (block.type === 'checkbox') {
          _.each(row.value, function(column) {
            if (column) {
              row.filled = true;
              $scope.filledCount++;
              return false;
            }
          });
        }
      });
    });
    $scope.progress = $scope.filledCount > 0 ? Math.ceil($scope.filledCount / $scope.totalQuestionCount * 100) : 0;
  }, true);

  $scope.submit = function() {
    if ($scope.progress < 100) {
      return;
    }
    if (!$scope.formData.recaptcha) {
      swal('', 'Please complete the security check', 'warning');
      return;
    }
    Result.save({_id: null}, {survey: $scope.survey, 'g-recaptcha-response': $scope.formData.recaptcha}, function(result) {
      $rootScope.$emit('surveyFilled');
      $state.go('result', {id: result._id});
    });
  };
});
