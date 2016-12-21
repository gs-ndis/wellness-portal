'use strict';

angular.module('wellness').filter('nl2br', function($sce) {
  return function(msg, isXHTML) {
    isXHTML = isXHTML || true;
    var breakTag = (isXHTML) ? '<br />' : '<br>';
    msg = (msg + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
    return $sce.trustAsHtml(msg);
  };
});
