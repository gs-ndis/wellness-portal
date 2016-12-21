'use strict';

angular.module('wellness').config(function($stateProvider) {
  $stateProvider.state('admin.survey', {
    url: '/survey',
    template: '<div ui-view/>',
    abstract: true,
    authenticate: false,
    access: 'admin'
  });
  $stateProvider.state('admin.survey.list', {
    url: '',
    templateUrl: 'app/admin/survey/survey.list.html',
    controller: 'AdminSurveyListCtrl',
    authenticate: false,
    access: 'admin'
  });
  $stateProvider.state('admin.survey.edit', {
    url: '/:id',
    templateUrl: 'app/admin/survey/survey.edit.html',
    controller: 'AdminSurveyEditCtrl',
    authenticate: false,
    access: 'admin'
  });
});
