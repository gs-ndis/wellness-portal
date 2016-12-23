'use strict';

angular.module('wellness').config(function($stateProvider) {
  $stateProvider.state('survey', {
    url: '/survey/:id',
    templateUrl: 'app/survey/survey.html',
    controller: 'SurveyCtrl',
    authenticate: false
  });
  $stateProvider.state('result', {
    url: '/result/:id',
    templateUrl: 'app/survey/survey.result.html',
    controller: 'SurveyResultCtrl',
    authenticate: false
  });
});
