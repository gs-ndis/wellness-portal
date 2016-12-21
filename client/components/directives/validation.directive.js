'use strict';

var validPhoneRegEx = /^((([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})([0-9]{4})$/;

angular.module('wellness').directive('phone', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.phone = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid
          return true;
        }
        var number = (viewValue + '').replace(/[^0-9]+/g, '');

        if (number.length < 10 || !validPhoneRegEx.test(number)) {
          return false;
        }
        return true;
      };
    }
  };
});

var validEmailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)\b/i;

angular.module('wellness').directive('validateEmail', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.email = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid
          return true;
        }

        if (validEmailRegex.test(viewValue)) {
          // it is valid
          return true;
        }

        // it is invalid
        return false;
      };
    }
  };
});

angular.module('wellness').directive('compareTo', function() {
  return {
    require: 'ngModel',
    scope: {
      otherModelValue: '=compareTo'
    },
    link: function(scope, element, attributes, ngModel) {

      ngModel.$validators.compareTo = function(modelValue) {
        return modelValue === scope.otherModelValue;
      };

      scope.$watch('otherModelValue', function() {
        ngModel.$validate();
      });
    }
  };
});
