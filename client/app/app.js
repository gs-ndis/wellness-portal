'use strict';

angular.module('wellness', [
  'ngCookies',
  'ipCookie',
  'ngResource',
  'ngSanitize',
  'ui.router',
  'ui.bootstrap',
  'ui.bootstrap.tooltip',
  'ui.bootstrap.popover',
  'smart-table',
  'dialogs.main',
  'ngFileUpload',
  'angular-growl',
  'ngMessages',
  'ui.mask',
  'angularAwesomeSlider',
//  'btford.socket-io',
  'ngAnimate',
  'sticky',
  'ui.select',
  'frapontillo.bootstrap-switch',
  'angularMoment',
  'angularSpinner',
  'textAngular',
  'selectionModel',
  'angular-loading-bar',
  'multiStepForm',
  'ui.bootstrap.datetimepicker',
  'ui.utils.masks',
  'uiGmapgoogle-maps',
  'ngDragDrop',
  'ui.tree',
  'ngStorage',
//  'ngMaterial',
  'configenv',
//  'dndLists',
  'ng-sortable',
  'ui.gravatar',
  'matchMedia',
  'ui.indeterminate',
  'mgo-angular-wizard',
  'btford.markdown',
  'monospaced.elastic'
]).config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, growlProvider, $provide, $compileProvider) {
  $urlRouterProvider.otherwise('/');

  $locationProvider.html5Mode(true);
  $httpProvider.interceptors.push('authInterceptor');

  growlProvider.globalTimeToLive(3000);
  growlProvider.onlyUniqueMessages(true);
  growlProvider.globalReversedOrder(true);
  growlProvider.globalPosition('top-center');

  $provide.decorator('$locale', ['$delegate', function($delegate) {
      if ($delegate.id === 'en-us') {
        $delegate.NUMBER_FORMATS.PATTERNS[1].negPre = '-\u00A4';
        $delegate.NUMBER_FORMATS.PATTERNS[1].negSuf = '';
        $delegate.NUMBER_FORMATS.PATTERNS[1].minFrac = 0;
        $delegate.NUMBER_FORMATS.PATTERNS[1].maxFrac = 0;
      }
      return $delegate;
    }]);
  $stateProvider.state('shortUrl', {
    url: '/s/:hash',
    abstract: true
  });
  if (!$httpProvider.defaults.headers.get) {
    $httpProvider.defaults.headers.get = {};
  }
  $httpProvider.defaults.headers.get['If-Modified-Since'] = '0';

  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto):/);

}).factory('authInterceptor', function($rootScope, $q, ipCookie, $window, $location) {
  return {
    // Add authorization token to headers
    request: function(config) {
      config.headers = config.headers || {};
      if (ipCookie('token')) {
        config.headers.Authorization = 'Bearer ' + ipCookie('token');
      }
      return config;
    },
    // Intercept 401s and redirect you to login
    responseError: function(response) {
      if (response.status === 401) {
        ipCookie.remove('token');
        if ($window.location.pathname !== '/login') {
          $window.location = '/login?ref=' + $location.path();
        }
        return $q.reject(response);
      } else if (response.status === 423) {
        $location.path('/pending');
        return $q.reject(response);
      } else {
        return $q.reject(response);
      }
    }
  };
}).run(function($rootScope, $location, Auth, $state, $stateParams, $window, $anchorScroll) {
  // Redirect to login if route requires auth and you're not logged in
  $rootScope.$on('$stateChangeError', console.log.bind(console));
//  $rootScope.$on('$stateChangeStart', function(event, next) {
//    Auth.isLoggedInAsync(function(loggedIn) {
//      $rootScope.isLoggedIn = loggedIn;
//      $rootScope.pendingUser = Auth.isPending();
//      if (next.authenticate && Auth.isPending()) {
//        event.preventDefault();
//        $state.go('pending');
//        return;
//      }
//      if (next.authenticate && !loggedIn) {
//        event.preventDefault();
//        $window.location = '/login?ref=' + $location.path();
//        $state.go('login');
//        return;
//      }
//      if (next.access === 'admin' && loggedIn && !Auth.isAdmin()) {
//        $state.go('dashboard');
//        return;
//      }
//      if (next.role && loggedIn && !Auth.hasRole(next.role)) {
//        if (Auth.getHomepage()) {
//          $location.path(Auth.getHomepage());
//        } else {
//          $state.go('dashboard');
//        }
//        return;
//      }
//      if (next.permissions && loggedIn && !Auth.hasAccess(next.permissions)) {
//        if (Auth.getHomepage()) {
//          $location.path(Auth.getHomepage());
//        } else {
//          $state.go('dashboard');
//        }
//        return;
//      }
//
//      if (next.name === 'login' && loggedIn) {
//        return $location.path('/');
//      } else if (next.name === 'login' && !loggedIn) {
//        $rootScope.isLoggedIn = false;
//      }
//    });
//  });
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.$anchorScroll = $anchorScroll;
  $rootScope.dateFormat = 'MM/dd/yyyy';
  $rootScope.dateTimeFormat = 'MM/dd/yyyy HH:mm';
  //$rootScope.hasAccess = Permissions.hasAccess;
});
