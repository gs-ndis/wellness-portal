'use strict';

angular.module('wellness').controller('AdminUserEditCtrl', function($scope, User, $cookieStore, $state, growl, $timeout, $stateParams, logSwal) {
  $scope.allUsers = [];
  $scope.baseRoles = [
    {name: 'user', title: 'User'},
//    {name: 'manager', title: 'Manager'},
    {name: 'admin', title: 'Admin'},
//    {name: 'contact', title: 'Contact'}
  ];
//  $scope.roles = Role.query();

  $scope.userDataLoaded = false;

//  $scope.findUsers = function(query) {
//    var role = $scope.user.role === 'user' ? ['manager', 'admin'] : 'user';
//
//    User.query({search: query, role: role, number: -1, profile: true}, function(result) {
//      $scope.allUsers = result.data;
//      $scope.userDataLoaded = true;
//    });
//  };

  var firstTime = true;

  User.get({id: $stateParams.id}, function(result) {
    $scope.user = result;

//    $scope.findUsers();
    $scope.$watch('user', function() {
      if (firstTime) {
        firstTime = false;
        return;
      }

      $scope.user.sales = _.uniq($scope.user.sales);
      User.update({id: $scope.user._id}, angular.copy($scope.user), function() {
        growl.success('User updated successfully');
      }, function(result) {
        var message = 'Something went wrong, user is not saved. Try again later.';
        if (result.data && result.data.message) {
          message = result.data.message;
        }
        growl.error(message);
      });
    }, true);

  });
  $scope.resetPassword = function() {
    if (!$scope.user._id) {
      return;
    }
    swal({
      title: 'Warning',
      text: 'Are you sure want to reset password for this user?',
      type: 'warning',
      showCancelButton: true,
      closeOnConfirm: false,
      animation: 'slide-from-top'
    }, function() {
      swal.disableButtons();
      User.resetPassword({id: $scope.user._id}, {}, function() {
        swal({
          title: 'Success!',
          text: 'Password has been reset successfully. Email with reset password instructions was sent to user.',
          type: 'success'
        }, function() {
        });
      }, function(err) {
        logSwal('Error!', err.data && err.data.message || 'Something went wrong. Please try again later.', 'warning',err);
      });
    });
  };
});
