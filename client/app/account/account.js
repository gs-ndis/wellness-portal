'use strict';

angular.module('wellness').config(function($stateProvider) {
  $stateProvider.state('loginApiKey', {
    url: '/login/:apikey?:id',
    templateUrl: 'app/account/login/login.apikey.html',
    controller: 'LoginApiKeyCtrl'
  });
  $stateProvider.state('login', {
    url: '/login?:ref',
    templateUrl: 'app/account/login/login.html',
    controller: 'LoginCtrl',
    params: {
      'ref': ''
    }
  });
  $stateProvider.state('signup', {
    url: '/signup/:token?:id',
    templateUrl: 'app/account/signup/signup.html',
    controller: 'SignupCtrl'
  });
  $stateProvider.state('settings', {
    url: '/settings',
    templateUrl: 'app/account/settings/settings.html',
    controller: 'SettingsCtrl',
    authenticate: true,
    permissions: 'pages.settings.view'
  });
  $stateProvider.state('resetPassword', {
    url: '/reset/:token',
    templateUrl: 'app/account/reset/reset.password.html',
    controller: 'ResetPasswordCtrl'
//    authenticate: true
  });
});