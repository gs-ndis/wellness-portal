'use strict';

angular.module('wellness').controller('AdminSurveyEditCtrl', function($scope, Survey, $cookieStore, $state, growl, $timeout, $stateParams) {
  $scope.survey = {};
  $scope.questionTypeOptions = [
    {key: 'radio', value: 'Radio'},
    {key: 'checkbox', value: 'Checkbox'}
  ];
  $scope.getAnswerGroupTemplate = function() {
    return {
      answers: [
        {},
        {},
        {},
        {}
      ],
      questions: [
        {type: _.head($scope.questionTypeOptions).key},
        {type: _.head($scope.questionTypeOptions).key}
      ]
    };
  };


  $scope.survey.title = 'K-6 Psychological Distress';
  $scope.survey.description = 'The following questions enquire about how you have been feeling over the last four weeks. Please read each question carefully and then indicate, by clicking on the relevant button, the response that best describes how you have been feeling';
  $scope.survey.answerGroups = [
    {
      answers: [
        {title: 'All of the time'},
        {title: 'Most of the time'},
        {title: 'Some of the time'},
        {title: 'A little of the time'},
        {title: 'None of the time'}
      ],
      questions: [
        {type: 'radio', title: 'In the past 4 weeks, about how often did you feel so sad nothing could cheer you up?'},
        {type: 'radio', title: 'In the past 4 weeks, about how often did you feel nervous?'},
        {type: 'radio', title: 'In the past 4 weeks, about how often did you feel hopeless?'},
        {type: 'radio', title: 'In the past 4 weeks,, about how often did you feel restless or fidgety?'},
        {type: 'radio', title: 'In the past 4 weeks, about how often did you feel that everything was an effort?'},
        {type: 'radio', title: 'In the past 4 weeks, about how often did you feel worthless?'}
      ]
    }
  ];

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
