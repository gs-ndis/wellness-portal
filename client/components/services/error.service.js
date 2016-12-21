'use strict';

angular.module('wellness').factory('Error', function($state) {
  return function(error, redirectTo, cb) {
    cb = cb || angular.noop;
    if (_.isFunction(redirectTo)) {
      cb = redirectTo;
    }
    var callback = function() {
      $state.go(redirectTo);
      cb();
    };
//    airbrakeFactory.notify({error: error});
    console.error(error);
    if (error.status) {
      if (error.status === 403) {
        var text = 'You dont have access to this page';
        if (error.config && error.config.url.indexOf('leads') !== -1) {
          text = 'You don\'t have access to view this page.';
        }
        return swal({
          title: 'Forbidden',
          text: text,
          html: true,
          type: 'error'
        }, callback);
      }
      if (error.data) {
        return swal({
          title: error.data && error.data.message || error.data || error,
          type: 'error'
        }, callback);
      }
    }


    return swal({
      title: 'Error',
      text: 'Something went wrong',
      type: 'error'
    }, callback);
  };
}).factory('logSwal', function() {
  return function(data, callback, type, error) {
    var params = {};
    var customizations = arguments[0];
    switch (typeof customizations) {
      case 'string':
        params.title = customizations;
        params.text = arguments[1] || '';
        params.type = arguments[2] || '';
        break;
      case 'object':
        params = data;
        break;
      default:
        break;
    }

    if (params && params.type === 'error') {
      var errorText;
      if (params.text && typeof params.text === 'object') {
        try {
          errorText = JSON.stringify(params.text);
        } catch (e) {
          console.log('parce error', e);
        }
      }
      console.error({error: errorText || params.text, params: {cause: error}});
//      airbrakeFactory.notify({error: errorText || params.text, params: {cause: error}});
    }
    return swal(data, callback, type);
  };
});
