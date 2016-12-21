'use strict';

angular.module('wellness').controller('AdminSettingsCtrl', function($scope, Settings, dialogs, growl, $state, $timeout) {
  var firstUpdate = true;

  function getAdditionalSettings() {
    $scope.additionalSettings = Settings.additionalSettings(function() {
      $scope.signupUrl = $state.href('shortUrl', {hash: $scope.additionalSettings.signupHash}, {absolute: true});
    });
  }
  getAdditionalSettings();

  function updateSettingsList() {
    $timeout(function() {
      $scope.isLoading = true;
      Settings.get(function(data) {
        $scope.settings = data;
        $scope.$watch('settings', function(newVal) {
          if (!newVal || firstUpdate) {
            firstUpdate = false;
            return;
          }
          Settings.save(angular.copy(newVal), function() {
            getAdditionalSettings();
            growl.success('Settings updated successfully');
          });
        }, true);

      });
      Settings.sample(function(data) {
        $scope.sampleSettings = data;
      });
    });
  }
  updateSettingsList();
  $scope.recreateSingupUrl = function() {
    Settings.recreateSingupUrl(function(result) {
      $scope.signupUrl = $state.href('shortUrl', {hash: result.hash}, {absolute: true});
    });
  };
});
