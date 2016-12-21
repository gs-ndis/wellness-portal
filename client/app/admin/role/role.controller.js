'use strict';

angular.module('wellness').controller('AdminRoleCtrl', function(Comment, dialogs, growl, $state, $timeout, Role, $scope) {

  $scope.roles = Role.query();


  $scope.editRole = function(role) {
    var dialog = dialogs.create('app/admin/role/dialogs/edit.role.dialog.html', 'AdminEditRoleDialogCtrl', {role: role}, {size: 'lg', keyboard: true, backdrop: true});
    dialog.result.then(function(preset) {
      $scope.role = {};

      _.each($scope.resources, function(resource, key) {
        if (_.isBoolean(preset[key])) {
          $scope.role[key] = preset[key];
        } else if (preset[key] && preset[key] === '*') {
          if (!$scope.permissions[key]) {
            $scope.role[key] = true;
          } else {
            _.each($scope.permissions[key], function(permission, permissionKey) {
              $scope.role[key + '.' + permissionKey] = _.pick(permission, ['view', 'update', 'delete']);
            });
          }
        } else {
          _.each(preset[key], function(permission, permissionKey) {
            $scope.role[key + '.' + permissionKey] = _.pick(permission, ['view', 'update', 'delete']);
          });
        }
      });
    });
  };

  $scope.removeRole = function(role) {
    swal({
      title: 'Are you sure?',
      text: 'You will not be able to recover this role!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!',
      closeOnConfirm: false
    }, function() {
      Role.remove({_id: role._id}, function() {
        swal('Deleted!', 'Role has been deleted.', 'success');
        var index = $scope.roles.indexOf(role);
        if (index >= 0) {
          $scope.roles.splice(index, 1);
        }
      });
    });
  };


});

