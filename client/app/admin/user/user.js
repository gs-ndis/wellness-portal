'use strict';

angular.module('wellness').config(function($stateProvider) {
  $stateProvider.state('admin.users', {
    url: '/users',
    template: '<div ui-view/>',
    abstract: true,
    authenticate: true,
    access: 'admin'
  });
  $stateProvider.state('admin.users.list', {
    url: '',
    templateUrl: 'app/admin/user/user.html',
    controller: 'AdminUserListCtrl',
    authenticate: true,
    access: 'admin'
  });
  $stateProvider.state('admin.users.edit', {
    url: '/:id',
    templateUrl: 'app/admin/user/user.edit.html',
    controller: 'AdminUserEditCtrl',
    authenticate: true,
    access: 'admin'
  });
});
