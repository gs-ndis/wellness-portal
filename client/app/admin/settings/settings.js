'use strict';

angular.module('wellness').config(function($stateProvider) {
  $stateProvider.state('admin.settings', {
    url: '/settings',
    templateUrl: 'app/admin/settings/settings.html',
    controller: 'AdminSettingsCtrl',
    authenticate: true,
    access: 'admin'
  });
});
