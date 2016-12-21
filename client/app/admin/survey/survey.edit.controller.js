'use strict';

angular.module('wellness').controller('AdminSurveyEditCtrl', function($scope, Survey, $cookieStore, $state, growl, $timeout, dialogs, $stateParams) {
  $scope.survey = {};
  $scope.questionTypeOptions = [
    {key: 'radio', value: 'Radio'},
    {key: 'checkbox', value: 'Checkbox'}
  ];


  $scope.survey.title = 'K-6 Psychological Distress';
  $scope.survey.description = 'The following questions enquire about how you have been feeling over the last four weeks. Please read each question carefully and then indicate, by clicking on the relevant button, the response that best describes how you have been feeling';
  $scope.survey.blocks = [
    {
      type: 'radio',
      columns: [
        {title: 'All of the time', score: 1},
        {title: 'Most of the time', score: 2},
        {title: 'Some of the time', score: 3},
        {title: 'A little of the time', score: 4},
        {title: 'None of the time', score: 5}
      ],
      rows: [
        {title: 'In the past 4 weeks, about how often did you feel so sad nothing could cheer you up?'},
        {title: 'In the past 4 weeks, about how often did you feel nervous?'},
        {title: 'In the past 4 weeks, about how often did you feel hopeless?'},
        {title: 'In the past 4 weeks, about how often did you feel restless or fidgety?'},
        {title: 'In the past 4 weeks, about how often did you feel that everything was an effort?'},
        {title: 'In the past 4 weeks, about how often did you feel worthless?'}
      ]
    }
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

  $scope.getResults = function() {
//    _.each($scope.survey.answerGroups, function(answerGroup) {
//      _.each(answerGroup.questions, function(question) {
////        console.log(question);
//      });
//    });
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
    swal('Processing...');
    swal.disableButtons();
    $scope.variant.$save().then(function() {
      swal('Success', 'Support items successfully saved!', 'success');
      $state.go('admin.variant.list');
    }).catch(function(err) {
      console.error(err);
      swal('', 'Something went wrong. Please try again later', 'warning');
    }).finally(function() {
      swal.enableButtons();
    });
  };
});
