'use strict';

angular.module('wellness').config(function($stateProvider) {
  $stateProvider.state('admin.result', {
    url: '/result',
    template: '<div ui-view/>',
    abstract: true,
    authenticate: false,
    access: 'admin'
  });
  $stateProvider.state('admin.result.list', {
    url: '',
    templateUrl: 'app/admin/result/result.list.html',
    controller: 'AdminResultListCtrl',
    authenticate: false,
    access: 'admin'
  });
  $stateProvider.state('admin.result.edit', {
    url: '/:id',
    templateUrl: 'app/admin/result/result.edit.html',
    controller: 'AdminResultEditCtrl',
    authenticate: false,
    access: 'admin'
  });
});
