'use strict';

angular.module('wellness').controller('NavbarCtrl', function($scope, $rootScope, $location, $state, $stateParams, ipCookie, $timeout, dialogs, Auth, screenSize) {

  $scope.formData = {};
  $scope.formData.searchQuery = '';
  $rootScope.helpBlocks = [];
  $rootScope.menu = [];

  $scope.isCollapsed = true;
//  $scope.isLoggedIn = Auth.isLoggedIn;
//  $scope.isAdmin = Auth.isAdmin;
//  $scope.getCurrentUser = Auth.getCurrentUser;
  $timeout(function() {
    $scope.formData.searchQuery = $stateParams.query;
  });

  $rootScope.sideBarCollapsed = false;
  $rootScope.navBarCollapsed = false;
  // Using dynamic method `on`, which will set the variables initially and then update the variable on window resize
  $scope.desktop = screenSize.on('lg', function(match) {
    $scope.desktop = match;
  });

  $scope.mobile = screenSize.on('md, xs, sm', function(match) {
    $scope.mobile = match;
  });

  if ($scope.mobile) {
    $rootScope.sideBarCollapsed = true;
    $rootScope.navBarCollapsed = true;
  }

  $scope.toogleSideBar = function() {
    $rootScope.sideBarCollapsed = !$rootScope.sideBarCollapsed;
  };

  $rootScope.$on('$stateChangeSuccess', function() {
    if (!$stateParams.query) {
      $scope.formData.searchQuery = '';
    }
  });

  $rootScope.openCommentDialog = function() {
    var dialog = dialogs.create('components/navbar/comment.dialog.html', 'CommentDialogCtrl', {}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function() {
      swal('Success!', 'Thank you for your input it is greatly appreciated!', 'success');
    });
  };

  $rootScope.calendarDate = function(date) {
    if (!date) {
      return '';
    }
    var calendarDate = moment(date);
    if (calendarDate.isValid) {
      return calendarDate.calendar();
    } else {
      return '';
    }
  };

  $scope.logout = function() {
    Auth.logout();
    $timeout(function() {
      $location.path('/');
      $rootScope.initContentfulData();
    });
  };

  $scope.isActive = function(route) {
    return route === $location.path();
  };
});

angular.module('wellness').controller('CommentDialogCtrl', function($scope, Offer, Lead, Auth, Comment, $modalInstance, logSwal) {
  $scope.commentForm = {};
  $scope.cancel = function() {
    $modalInstance.dismiss();
  };
  $scope.send = function() {
    if (!$scope.commentForm.$valid) {
      return;
    }
    Comment.save({}, $scope.comment, function() {
      $modalInstance.close();
    }, function(err) {
      logSwal('Error!', 'Something went wrong. Please try again later.', 'error', err);
    });
  };
});

angular.module('wellness').filter('matchMedia', function($window) {
  return function matchMedia(mediaQueryString) {
    return $window.matchMedia(mediaQueryString).matches;
  };
});

