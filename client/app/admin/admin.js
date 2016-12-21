'use strict';

angular.module('wellness').config(function($stateProvider) {
  $stateProvider.state('admin', {
    url: '/admin',
    templateUrl: 'app/admin/admin.html',
    controller: 'AdminCtrl',
    authenticate : false,
    access : 'admin',
    abstract: true
  });
});
