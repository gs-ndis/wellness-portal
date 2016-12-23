'use strict';

angular.module('wellness').controller('AdminResultListCtrl', function($scope, Result, dialogs, $cookieStore, $state, $stateParams) {
  $scope.stTable = {};
  $scope.stTable.itemsPerPage = $cookieStore.get('itemsPerPage') || 10;
  $scope.paginationNumbers = [10, 25, 50, 100, 500, 1000];
  $scope.tableState = {};
  $scope.users = [];

  $scope.tableUpdate = function(tableState) {
    $scope.tableState = tableState;
    $cookieStore.put('itemsPerPage', $scope.stTable.itemsPerPage);
    updateResultItemList();
  };

  function updateResultItemList() {
    var query = {};
    $scope.loading = true;
    $scope.searchStr = $stateParams.search;
    if ($stateParams.search) {
      query.search = $stateParams.search;
    }
    _.extend(query, $scope.tableState.pagination, {filterSearch: $scope.tableState.search});
    Result.query(query, function(result) {
      $scope.loading = false;
      $scope.results = result.data;
      $scope.tableState.pagination.numberOfPages = Math.ceil(result.count / $scope.tableState.pagination.number);
    });
  }


  $scope.removeResult = function(result) {
    swal({
      title: 'Are you sure?',
      text: 'You will not be able to recover this result!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!',
      closeOnConfirm: false
    }, function() {
      Result.remove({_id: result._id}, function() {
        swal('Deleted!', 'Result has been deleted.', 'success');
        updateResultItemList();
      });
    });
  };

});
