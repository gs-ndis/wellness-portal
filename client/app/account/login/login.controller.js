'use strict';

angular.module('wellness').controller('LoginCtrl', function($scope, $rootScope, Auth, $location, $window, dialogs, $stateParams) {
  $scope.user = {};
  $scope.errors = {};

  $scope.login = function(form) {
    $scope.submitted = true;

    if (form.$valid) {
      Auth.login({
        email: $scope.user.email,
        password: $scope.user.password
      }).then(function() {
        // Logged in, redirect to home
        if (Auth.isPending()) {
          $location.path('/pending');
        } else if ($stateParams.ref && $stateParams.ref.length) {
          $location.path($stateParams.ref);
        } else {
          $location.path('/');
        }
        $rootScope.initContentfulData();
      }).catch(function(err) {
        $scope.errors.other = err.message;
      });
    }
  };

  $scope.forgotPassword = function() {
    var dialog = dialogs.create('app/account/login/forgot.password.dialog.html', 'ForgotPasswordDialogCtrl', {}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function() {
    });
  };

  $scope.loginOauth = function(provider) {
    $window.location.href = '/auth/' + provider;
  };
});

angular.module('wellness').controller('ForgotPasswordDialogCtrl', function($scope, $modalInstance, User, logSwal) {
  $scope.forgotPasswordForm = {};

  $scope.cancel = function() {
    $modalInstance.dismiss();
  };
  $scope.send = function() {
    if (!$scope.forgotPasswordForm.$valid) {
      return;
    }
    User.forgotPassword({}, {email: $scope.user.email}, function() {
      swal({
        title: 'Success!',
        text: 'Email with password reset instructions was sent to specified email address',
        type: 'success'
      }, function() {
        $modalInstance.close();
      });
    }, function(err) {
      logSwal('Error!', (err && err.data && err.data.message) || 'Something went wrong. Try again later', 'error', err);
    });
  };
});

angular.module('wellness').controller('LoginApiKeyCtrl', function($scope, $rootScope, $stateParams, Auth, $location, $state, logSwal) {
  $scope.user = {};
  $scope.errors = {};

  Auth.loginApiKey($stateParams.apikey).then(function(user) {
    // Logged in, redirect to home
    if ($stateParams.id) {
      $state.go('lead.details.general', {id: $stateParams.id});
    } else if (user.homepage) {
      $location.path(user.homepage);
    } else {
      $location.path('/');
    }
  }).catch(function(err) {
    if (err === 'passwordExists') {
      logSwal('Error!', (err && err.data && err.data.message) || 'Please login with your credentials.', 'error', err);
      $state.go('login');
    }
    $scope.errors.other = err.message;
  });

});
