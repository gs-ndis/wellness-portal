'use strict';
var mongoose = require('mongoose');
var util = require('util');
var _ = require('lodash');

function FormattedNumber(path, options) {
  mongoose.SchemaTypes.Number.call(this, path, options);
}

/*!
 * inherits
 */

util.inherits(FormattedNumber, mongoose.SchemaTypes.Number);

FormattedNumber.prototype.cast = function(val) {
  if (_.isString(val)) {
    var number = val;
    if (!isNaN(number) && number.length) {
      return Number(number);
    } else {
      number = val.replace(/[^\d\-+\.]*/ig, '');
    }

    if (!number.length) {
      return;
    } else if (!isNaN(number)) {
      return Number(number);
    }
  } else if (_.isNumber(val)) {
    if (isNaN(val)) {
      return;
    } else {
      return val;
    }
  } else {
    return new Error('Should pass in a number or string');
  }
};

module.exports = function(mongoose) {
  mongoose.Types.FormattedNumber = mongoose.SchemaTypes.FormattedNumber = FormattedNumber;
  return FormattedNumber;
};

