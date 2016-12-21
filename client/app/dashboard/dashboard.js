'use strict';

angular.module('wellness').config(function($stateProvider) {
  $stateProvider.state('dashboard', {
    url: '/',
    templateUrl: 'app/dashboard/dashboard.html',
    controller: 'DashboardCtrl',
    authenticate: false
  });
});
