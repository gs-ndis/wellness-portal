'use strict';

angular.module('wellness').controller('ResetPasswordCtrl', function($scope, User, $window, $stateParams,logSwal) {
  $scope.errors = {};

  $scope.resetPassword = function(form) {
    if (!form.$valid) {
      return;
    }
    swal({
      title: '',
      text: 'Processing...',
      type: 'info',
      closeOnConfirm: false,
      animation: 'slide-from-top'
    });
    swal.disableButtons();
    User.resetPassword({}, {newPassword: $scope.user.newPassword, token: $stateParams.token}, function() {
      $scope.message = 'Password successfully changed.';
      swal({
        title: 'Success!',
        text: 'New password has been set. You can login now with new password',
        type: 'success'
      }, function() {
        $window.location = '/login';
      });
    }, function(err) {
      logSwal('Error!', err.data && err.data.message || 'Something went wrong. Please try again later.', 'warning');
    });
  };
});
