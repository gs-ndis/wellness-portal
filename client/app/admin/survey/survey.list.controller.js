'use strict';

angular.module('wellness').controller('AdminSurveyListCtrl', function($scope, Survey, dialogs, $cookieStore, $state, $stateParams) {
  $scope.stTable = {};
  $scope.stTable.itemsPerPage = $cookieStore.get('itemsPerPage') || 10;
  $scope.paginationNumbers = [10, 25, 50, 100, 500, 1000];
  $scope.tableState = {};
  $scope.users = [];

  $scope.unitOptions = [
    {key: 'Hour', value: 'Hour'},
    {key: 'Day', value: 'Day'},
    {key: 'Week', value: 'Week'},
    {key: 'Annual', value: 'Annual'},
    {key: 'Each', value: 'Each'}
  ];

  $scope.tableUpdate = function(tableState) {
    $scope.tableState = tableState;
    $cookieStore.put('itemsPerPage', $scope.stTable.itemsPerPage);
    updateSupportItemList();
  };

  function updateSupportItemList() {
    var query = {};
    $scope.loading = true;
    $scope.searchStr = $stateParams.search;
    if ($stateParams.search) {
      query.search = $stateParams.search;
    }
    _.extend(query, $scope.tableState.pagination, {filterSearch: $scope.tableState.search});
    Survey.query(query, function(result) {
      $scope.loading = false;
      $scope.variants = result.data;
      $scope.tableState.pagination.numberOfPages = Math.ceil(result.count / $scope.tableState.pagination.number);
    });
  }

});
