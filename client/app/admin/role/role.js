'use strict';

angular.module('wellness').config(function($stateProvider) {
  $stateProvider.state('admin.role', {
    url: '/roles',
    template: '<div ui-view/>',
    abstract: true,
    authenticate: true,
    access: 'admin'
  });
  $stateProvider.state('admin.role.list', {
    url: '',
    templateUrl: 'app/admin/role/role.html',
    controller: 'AdminRoleCtrl',
    authenticate: true,
    access: 'admin'
  });
  $stateProvider.state('admin.role.edit', {
    url: '/edit/:id',
    templateUrl: 'app/admin/role/role.edit.html',
    controller: 'AdminRoleEditCtrl',
    authenticate: true,
    access: 'admin'
  });
});
