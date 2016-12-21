'use strict';

angular.module('wellness').controller('SignupCtrl', function($scope, Auth, User, $location, $stateParams, $window) {
  $scope.user = {name: $stateParams.info, email: $stateParams.email};
  $scope.errors = {};
  User.checkSignupToken({token: $stateParams.token}, {userId: $stateParams.id}, function(result) {
    $scope.user = result;
  }, function(err) {
    if (err && err.status === 403) {
      swal('Error!', err.data && err.data.message || 'Signup token is invalid', 'warning');
    } else {
      swal('Error!', 'Something went wrong. Please try again later.', 'warning');
    }
    $location.path('/login');
  });



  $scope.register = function(form) {
    $scope.submitted = true;

    if (form.$valid) {
      Auth.createUser({
        name: $scope.user.name,
        email: $scope.user.email,
        password: $scope.user.password,
        phone: $scope.user.phone
      }).then(function() {
        // Account created, redirect to home
        $location.path('/');
      }).catch(function(err) {
        err = err.data;
        $scope.errors = {};

        // Update validity of form fields that match the mongoose errors
        angular.forEach(err.errors, function(error, field) {
          form[field].$setValidity('mongoose', false);
          $scope.errors[field] = error.message;
        });
      });
    }
  };

  $scope.confirmRegistration = function(form) {
    $scope.submitted = true;

    if (form.$valid) {
      Auth.activateUser({
        _id: $stateParams.id,
        password: $scope.user.password,
        phone: $scope.user.phone
      }).then(function() {
        // Account created, redirect to home
        $location.path('/');
      }).catch(function(err) {
        err = err.data;
        $scope.errors = {};

        // Update validity of form fields that match the mongoose errors
        angular.forEach(err.errors, function(error, field) {
          form[field].$setValidity('mongoose', false);
          $scope.errors[field] = error.message;
        });
      });
    }
  };

  $scope.submitForm = function(form) {

    if ($scope.user._id) {
      $scope.confirmRegistration(form);
    } else {
      $scope.register(form);
    }
  };

  $scope.loginOauth = function(provider) {
    $window.location.href = '/auth/' + provider;
  };
});
