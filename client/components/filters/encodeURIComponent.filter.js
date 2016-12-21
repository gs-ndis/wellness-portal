'use strict';

angular.module('wellness').filter('encodeURIComponent', function ($window)
{
  return $window.encodeURIComponent;
});
