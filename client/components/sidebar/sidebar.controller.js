'use strict';

angular.module('wellness').controller('SidebarCtrl', function($scope, $rootScope, Auth, $state, $stateParams, $timeout, screenSize) {
  $scope.desktop = screenSize.is('md, lg');
  $scope.mobile = screenSize.is('xs, sm');

  $rootScope.yesNoOptions = [
    {key: 1, value: 'Yes'},
    {key: 0, value: 'No'}
  ];

  if ($state.includes('search')) {
    var queryData = {};
    queryData.quote = $stateParams.quote || undefined;
    queryData.priceCap = $stateParams.priceCap || undefined;
    queryData.query = $stateParams.query;
  }

  $rootScope.highlightBlock = function(selector, targetState) {
    if (targetState && ($state.current.name !== targetState.name || !_.isMatch($state.params, targetState.params))) {
      $state.go(targetState.name, targetState.params).then(function() {
        $timeout(function() {
          $rootScope.highlightBlock(selector);
        }, 100);
      });
      return;
    }
    var block = $(selector);
    if (!block.length) {
      return;
    }
    block.find('input').focus();
    $('html, body').animate({
      scrollTop: block.offset().top - 100
    });
    block.removeClass('blink_me');
    $timeout(function() {
      block.addClass('blink_me');
    });
  };

  $scope.itemsCollapse = {
    instant: true,
    seller: true,
    offer: true,
    leads: true,
    contacts: true,
    education: true,
    buyers: true,
    system: true,
    admin: true
  };

  $scope.toggleMenu = function(item) {
    $scope.itemsCollapse[item] = !$scope.itemsCollapse[item];
  };
});
