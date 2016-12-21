'use strict';

angular.module('wellness').controller('SettingsCtrl', function($scope, User, Auth, dialogs) {
  $scope.errors = {};
  $scope.user = User.get();

  $scope.changePassword = function(form) {
    $scope.submitted = true;
    if (form.$valid) {
      Auth.changePassword($scope.user.oldPassword, $scope.user.newPassword).then(function() {
        $scope.savePasswordMessage = 'Password successfully changed.';
      }).catch(function() {
        form.password.$setValidity('mongoose', false);
        $scope.errors.other = 'Incorrect password';
        $scope.savePasswordMessage = '';
      });
    }
  };
  $scope.save = function() {
    User.update({id: 'me'}, angular.copy($scope.user)).$promise.then(function() {
      $scope.saveUserMessage = 'User info successfully saved';
    }).catch(function(err) {
      console.log(err);
    });
  };

  $scope.openSelectAddressDialog = function() {
    var dialog = dialogs.create('components/partials/select.address.dialog.html', 'SelectAddressDialogCtrl', {user: $scope.user}, {size: 'lg', keyboard: false});
    dialog.result.then(function(user) {
      $scope.user.address = user.address;
      Auth.setCurrentUser(user);
    });
  };
});
