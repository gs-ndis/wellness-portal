'use strict';

angular.module('wellness').factory('Util', function() {
  return {
    convertImgToBase64: function(url, callback, outputFormat) {
      var img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function() {
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(this, 0, 0);
        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        callback(dataURL);
        canvas = null;
      };
      img.src = url;
    },
    convertImgToObjectUrl: function(url, callback) {
      var img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function() {
        var canvas = document.createElement('CANVAS');
        var ctx = canvas.getContext('2d');
        canvas.height = this.height;
        canvas.width = this.width;
        ctx.drawImage(this, 0, 0);
//        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        canvas.toBlob(function(blob) {
          var url = window.URL || window.webkitURL;
          callback(url.createObjectURL(blob));
          canvas = null;
        });
//        callback(dataURL);

      };
      img.src = url;
    }, toUnderscore: function(value) {
      return _.trim(value).replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
    }
  };
});

