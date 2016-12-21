/* global angular */
'use strict';

angular.module('wellness').service("socket", function($rootScope) {
  this.events = {};

  // Receive Events
  this.on = function(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  };

  // Send Events
  this.emit = function(eventName, data, emitCallback) {
    if (this.events[eventName]) {
      angular.forEach(this.events[eventName], function(callback) {
        $rootScope.$apply(function() {
          callback(data);
        });
      });
    }
    if (emitCallback) {
      emitCallback();
    }
  };

});
