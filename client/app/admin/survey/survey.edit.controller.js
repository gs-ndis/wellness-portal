'use strict';

angular.module('wellness').controller('AdminSurveyEditCtrl', function($scope, Survey, $rootScope, $state, growl, $timeout, dialogs, $stateParams) {
  $scope.survey = {};
  $scope.questionTypeOptions = [
    {key: 'radio', value: 'Radio'},
    {key: 'checkbox', value: 'Checkbox'}
  ];

  var templateBlockRadio = {
    type: 'radio',
    columns: [
      {title: 'Choice 1', score: 1},
      {title: 'Choice 2', score: 2},
      {title: 'Choice 3', score: 3}
    ],
    rows: [
      {title: 'Question 1'},
      {title: 'Question 2'}
    ]
  };
  var templateBlockText = {
    type: 'text',
    columns: [
      {title: 'Text'}
    ],
    rows: [
      {title: 'Question 1'}
    ]
  };
  var templateBlockMultiText = {
    type: 'multi_text',
    columns: [
      {title: 'Text 1'},
      {title: 'Text 2'},
      {title: 'Text 3'}
    ],
    rows: [
      {title: 'Question 1'},
      {title: 'Question 2'}
    ]
  };

  function getTemplateForBlock(type) {
    var result = {};
    switch (type) {
      case 'checkbox':
      case 'radio':
        result = _.extend({}, templateBlockRadio, {type: type});
        break;
      case 'text':
        result = _.extend({}, templateBlockText);
        break;
      case 'multi_text':
        result = _.extend({}, templateBlockMultiText);
        break;
      default:
        result = _.extend({}, templateBlockRadio);
        break;
    }
    return result;
  }


  $scope.changeBlockType = function(block, newType) {
    block.type = newType;
  };

  $scope.addBlock = function(event, type) {
    if (type !== 'checkbox' && type !== 'radio') {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (!$scope.survey.blocks) {
      $scope.survey.blocks = [];
    }
    $scope.survey.blocks.push(getTemplateForBlock(type));
  };

  $scope.changeBlockColumns = function(block) {
    var dialog = dialogs.create('app/admin/survey/dialogs/survey.block.edit.columns.dialog.html', 'SurveyBlockEditColumnsDialogCtrl', {block: block}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      block.columns = result;
    });
  };
  $scope.changeBlockRows = function(block) {
    var dialog = dialogs.create('app/admin/survey/dialogs/survey.block.edit.rows.dialog.html', 'SurveyBlockEditRowsDialogCtrl', {block: block}, {size: 'md', keyboard: true, backdrop: true});
    dialog.result.then(function(result) {
      block.rows = result;
    });
  };

  $scope.editResults = function() {
    var dialog = dialogs.create('app/admin/survey/dialogs/survey.edit.results.dialog.html', 'SurveyEditResultsDialogCtrl', {survey: $scope.survey}, {size: 'lg', keyboard: true, backdrop: 'static'});
    dialog.result.then(function(results) {
      $scope.survey.results = results;
    });
  };

  $scope.removeBlock = function(block) {
    swal({
      title: 'Are you sure?',
      text: 'You will not be able to recover this block!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes, delete it!',
      closeOnConfirm: true
    }, function() {
      var index = $scope.survey.blocks.indexOf(block);
      if (index >= 0) {
        $timeout(function() {
          $scope.survey.blocks.splice(index, 1);
        });
      }
    });
  };

  $scope.getScoreForAnswer = function(question, index) {
    if (_.isNumber(question.scores[index])) {
      return question.scores[index];
    } else if (_.isNumber(question.scores[index - 1])) {
      return question.scores[index - 1] + 1;
    } else {
      return index + 1;
    }
  };

  if ($stateParams.id) {
    $scope.survey = Survey.get({_id: $stateParams.id});
  } else {
    $scope.survey = new Survey($scope.survey);
  }
  console.log($scope.survey);

  $scope.save = function() {
    if (!$scope.surveyForm.$valid) {
      swal('', 'You should fill all require fields before saving', 'warning');
      return;
    }
    if (!_.size($scope.survey.blocks)) {
      swal('', 'You should add at least one block with question before saving', 'warning');
      return;
    }
    if (!_.size($scope.survey.results)) {
      swal('', 'You should add at least one interpretation before saving', 'warning');
      return;
    }
    swal('Processing...');
    swal.disableButtons();
    $scope.survey.$save().then(function() {
      swal('Success', 'Survey successfully saved!', 'success');
      $rootScope.$emit('surveyUpdated');
      $state.go('admin.survey.list');
    }).catch(function(err) {
      console.error(err);
      swal('', 'Something went wrong. Please try again later', 'warning');
    }).finally(function() {
      swal.enableButtons();
    });
  };
});
