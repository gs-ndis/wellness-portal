'use strict';

angular.module('wellness').controller('AdminRoleEditCtrl', function($scope, Message, $state, $stateParams, Role, dialogs) {
  $scope.role = {
    active: true,
    isShare: false
  };

  if ($stateParams.id) {
    $scope.role = Role.get({_id: $stateParams.id}, function() {
      $scope.role.active = !!$scope.role.active;
      $scope.role.isShare = !!$scope.role.isShare;
    });
  }

  Role.defaults(function(result) {
    if (result) {
      $scope.resources = result.resources;
      $scope.permissions = result.permissions;
    }
  });

  $scope.openPresetDialog = function() {
    var dialog = dialogs.create('app/admin/role/dialogs/preset.dialog.html', 'AdminSelectPresetDialogCtrl', {}, {size: 'sm', keyboard: true, backdrop: true});
    dialog.result.then(function(preset) {
      $scope.role.permissions = preset || {};
    });
  };

  $scope.save = function() {
    if (!$scope.editRoleForm.$valid) {
      return;
    }
    var action;
    if ($scope.role._id) {
      action = Role.update({_id: $scope.role._id}, angular.copy($scope.role));
    } else {
      action = Role.save({}, angular.copy($scope.role));
    }
    action.$promise.then(function() {
      $state.go('admin.role.list');
    });
  };

});


angular.module('wellness').controller('AdminSelectPresetDialogCtrl', function($scope, Role, Message, $modalInstance) {
  Role.defaults(function(result) {
    $scope.presets = result.presets;
    $scope.selectedPreset = 'user';
  });

  $scope.cancel = function() {
    $modalInstance.dismiss();
  };

  $scope.save = function() {
    if (!$scope.selectPresetForm.$valid) {
      return;
    }
    if ($scope.selectedPreset && $scope.presets[$scope.selectedPreset]) {
      var preset = $scope.presets[$scope.selectedPreset];
      $modalInstance.close(preset);
    }
  };
});



