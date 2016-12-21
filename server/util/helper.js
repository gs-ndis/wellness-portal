'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var xml2js = require('xml2js');
var request = require('request');
var moment = require('moment');
var config = require('../config/environment');
var gm = require('gm');
var jwt = require('jsonwebtoken');

var fs = require('fs');

/**
 * Escape string for building regular expressions
 * https://github.com/benjamingr/RegExp.escape
 * @example new RegExp(escapeRegExp('Some $string$'))
 * @param {String} str Input string
 * @return {String} esaped string
 */
function escapeForRegExp(str) {
  return String(str).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Convert string to regular expression for mongodb
 * @param {String} str
 * @return {RegExp} regular expression
 */
function wrapRegExp(str) {
  return new RegExp(escapeForRegExp(str), 'ig');
}

/**
 * Convert feets to meters
 * @param {Number} x
 * @returns {Number|String}
 */
function feetToMeters(x) {
  if (typeof x !== "number") {
    return 'invalid input';
  } else {
    return x * 0.3048;
  }
}

/**
 * Convert miles to meters
 * @param {Number} x
 * @returns {Number|String}
 */
function mileToMeters(x) {
  if (typeof x !== "number") {
    return 'invalid input';
  } else {
    return x * 1609.344;
  }
}

/**
 * Helper function that generates random int
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}


/**
 * Helper function that handles the http request
 *
 * @param {string} url
 */
function httprequest(url) {
  var deferred = Promise.defer();
  request(url, function(err, response, body) {
    if (err) {
      deferred.reject(new Error(err));
    } else if (!err && response.statusCode !== 200) {
      deferred.reject(new Error(response.statusCode));
    } else {
      deferred.resolve(body);
    }
  });
  return deferred.promise;
}

/**
 * Helper function that converts xml to json
 *
 * @param {xml} xml
 */
function toJson(xml) {
  var deferred = Promise.defer();
  xml2js.parseString(xml, function(err, result) {
    if (err) {
      deferred.reject(new Error(err));
    } else {
      deferred.resolve(result);
    }
  });
  return deferred.promise;
}

/**
 * Helper function that takes params hash and converts it into query string
 *
 * @param {source} params
 * @param {Number} id
 */
function toQueryString(params, id) {
  var paramsString = '';
  for (var key in params) {
    if (params.hasOwnProperty(key)) {
      paramsString += '&' + key + '=' + encodeURIComponent(params[key]);
    }
  }
  return 'zws-id=' + id + paramsString;
}

/**
 * Helper function that checks for the required params
 *
 * @param {source} params
 * @param {array} reqParams -- required parameters
 */
function checkParams(params, reqParams) {
  if (reqParams.length < 1)
    return;

  if ((_.isEmpty(params) || !params) && (reqParams.length > 0)) {
    throw new Error('Missing parameters: ' + reqParams.join(', '));
  }

  var paramsKeys = _.keys(params);

  _.each(reqParams, function(reqParam) {
    if (paramsKeys.indexOf(reqParam) === -1) {
      throw new Error('Missing parameter: ' + reqParam);
    }
  });
}

var calendarDateFormat = {
  sameDay: '[Today] LT',
  nextDay: '[Tomorrow] LT',
  lastDay: '[Yesterday] LT',
  sameElse: 'L LT',
  nextWeek: 'L LT',
  lastWeek: 'L LT'
};

function fancyDateRange(start, end) {
  start = moment(start);
  end = moment(end);
  var result = '';
  if (start.date() === end.date()) {
    result = start.calendar(null, calendarDateFormat) + ' - ' + end.format('LT');
  } else {
    result = start.calendar(null, calendarDateFormat) + ' - ' + end.calendar(null, calendarDateFormat);
  }
  return result;
}

function formatAddress(address) {
  var result = '';
  if (address && _.isObject(address)) {
    var addressParts = [address.street, address.city, address.state];
    result = _.chain(addressParts).map(_.trim).compact().join(', ').value();

    var zip = _.trim(address.zip);
    if (!_.isEmpty(zip)) {
      result += ' ' + zip;
    }
  } else {
    result = address;
  }
  return _.trim(result);
//  return _.compact([(address.streetNumber ? address.streetNumber + ' ' : '') + address.street, address.city, address.state, address.zip]).join(', ');
}

function resizeImage(srcPath, targetPath, targetWidth, targetHeight, callback) {
//  if (typeof format === 'function') {
//    callback = format;
//    format = 'png';
//  }
  callback = callback || _.noop;
  return new Promise(function(resolve, reject) {
    gm(srcPath)
      .resize(targetWidth, targetHeight, '>')
      .background('white')
      .gravity('Center')
      .extent(targetWidth, targetHeight)
      .noProfile()
      .write(targetPath, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
        callback(err);
      });
  });
}

var longToShortState = {'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD', 'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC', 'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'};

var shortToLongState = {'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'};

function toFullStateName(state) {
  return _.get(shortToLongState, state, state);
}
function toShortStateName(state) {
  return _.get(longToShortState, state, state);
}

function copyFile(src, dst) {
  var is, os;
  return new Promise(function(resolve, reject) {
    fs.stat(src, function(err) {
      if (err) {
        return reject(err);
      }

      is = fs.createReadStream(src);
      os = fs.createWriteStream(dst);

      is.pipe(os);
      os.on('close', function(err) {
        if (err) {
          return reject(err);
        }
        resolve();
//      fs.utimes(dst, stat.atime, stat.mtime, cb);
      });
    });
  });
}

/**
 * Check each field for locale field(en-US) and remove it from contentful document
 * @param {Object|Array} source
 * @returns {Object|Array} result without locales
 */
function removeContentfulLocale(source) {
  var localeKey = 'en-US';
  if (_.isArray(source)) {
    return _.map(source, removeContentfulLocale);
  }
  if (!_.isObject(source)) {
    return source;
  }
  return _.reduce(source, function(result, item, key) {
    result[key] = item;
    if (_.isObject(item)) {
      if (item.hasOwnProperty(localeKey)) {
        result[key] = item[localeKey];
      } else {
        result[key] = removeContentfulLocale(item);
      }
    }
    return result;
  }, {});
}

exports.escapeForRegExp = escapeForRegExp;
exports.wrapRegExp = wrapRegExp;
exports.feetToMeters = feetToMeters;
exports.mileToMeters = mileToMeters;

exports.getRandomInt = getRandomInt;

exports.httprequest = httprequest;
exports.toJson = toJson;
exports.toQueryString = toQueryString;
exports.checkParams = checkParams;

exports.calendarDateFormat = calendarDateFormat;
exports.fancyDateRange = fancyDateRange;

exports.formatAddress = formatAddress;
exports.resizeImage = resizeImage;
exports.toFullStateName = toFullStateName;
exports.toShortStateName = toShortStateName;

exports.copyFile = copyFile;
exports.removeContentfulLocale = removeContentfulLocale;