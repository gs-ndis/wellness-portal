'use strict';

angular.module('wellness').controller('AdminUserListCtrl', function($scope, User, dialogs, $cookieStore, $state, Upload, $timeout, $filter) {
  $scope.stTable = {};
  $scope.stTable.itemsPerPage = $cookieStore.get('itemsPerPage') || 10;
  $scope.paginationNumbers = [10, 25, 50, 100, 500, 1000];
  $scope.tableState = {};
  $scope.users = [];
  $scope.roleOptions = [
    {key: 'user', value: 'User'},
//    {key: 'manager', value: 'Manager'},
    {key: 'admin', value: 'Admin'},
//    {key: 'contact', value: 'Contact'}
  ];
  $scope.indexedRoleOptions = _.keyBy($scope.roleOptions, 'key');
  $scope.statusOptions = [
    {key: 'true', value: 'Active'},
    {key: 'false', value: 'Inactive'}
  ];
  $scope.sendType = 'email';

  $scope.$watch('users', function() {
    $scope.selectedCount = _.chain($scope.users).filter('selected').size().value();
  }, true);

  User.query({number: -1}, function(result) {
    $scope.users = _.map(result.data, function(user) {
      user.active = user.active + ''; //for $filter
      user._role = user._role || {_id: 'default', name: 'Default'};
      return user;
    });
    if (!$scope.tableState.pagination) {
      $scope.tableState.pagination = {};
    }
    $scope.tableState.pagination.numberOfPages = Math.ceil(result.count / $scope.tableState.pagination.number);
    updateUsersList();
  });

  function updateUsersList() {
    $timeout(function() {
      var pagination = $scope.tableState.pagination;
      var output;
      var filtered = $scope.tableState.search && $scope.tableState.search.predicateObject ? $filter('customFilter')($scope.users, $scope.tableState.search.predicateObject) : $scope.users;
      $scope.filteredLength = filtered.length;
      if ($scope.tableState.sort && $scope.tableState.sort.predicate) {
        filtered = $filter('orderBy')(filtered, $scope.tableState.sort.predicate, $scope.tableState.sort.reverse);
      }
      pagination.totalItemCount = filtered.length;
      if (pagination.number !== undefined) {
        pagination.numberOfPages = filtered.length > 0 ? Math.ceil(filtered.length / pagination.number) : 1;
        pagination.start = pagination.start >= filtered.length ? (pagination.numberOfPages - 1) * pagination.number : pagination.start;
        output = filtered.slice(pagination.start, pagination.start + parseInt(pagination.number));
      }
      $scope.displayed = output || filtered;
    });
  }
  $scope.tableUpdate = function(tableState) {
    $scope.tableState = tableState;
    $cookieStore.put('itemsPerPage', $scope.stTable.itemsPerPage);
    updateUsersList();
  };

  function selectContacts(isSelected) {
    _.each($scope.users, function(user) {
      user.selected = isSelected;
    });
  }
  $scope.clearSelection = function() {
    selectContacts(false);
  };
  $scope.selectAll = function() {
    selectContacts(true);
  };
  $scope.selectFiltered = function() {
    var filtered = $scope.tableState.search.predicateObject ? $filter('customFilter')($scope.users, $scope.tableState.search.predicateObject) : $scope.users;
    _.each($scope.users, function(contact) {
      contact.selected = false;
    });
    _.each(filtered, function(contact) {
      contact.selected = true;
    });
  };

  $scope.sendSelected = function() {
    $scope.send(true);
  };

  $scope.send = function(onlySelected) {
    var users = [];
    if (onlySelected) {
      users = _.filter($scope.users, 'selected');
    } else {
      users = angular.copy($scope.users);
    }
    var dialog = dialogs.create('app/admin/contact/dialogs/send.message.tpl.html', 'AdminSendMessageDialogCtrl', {contacts: users, resource: User}, {size: 'lg', keyboard: true, backdrop: false});
    dialog.result.then(function() {
      updateUsersList();
    });
  };

});
