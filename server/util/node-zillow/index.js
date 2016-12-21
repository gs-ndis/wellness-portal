/**
 * node-zillow
 * http://github.com/ralucas/node-zillow
 *
 * Copyright (c) 2014 Richard Lucas
 * Licensed under the MIT license.
 */

var helpers = require('./helpers'),
  apiList = require('./api-list'),
  Promise = require('bluebird');

var rootUrl = 'http://www.zillow.com/webservice/';

/**
 * @class Zillow
 *
 * @param {string} id - your zillow api id
 */
function Zillow(id) {
  this.id = id;
}

/**
 * Carries out the getDeepSearchResults api call
 * @memberof Zillow
 *
 * @param {object} params - hash that takes address parameters
 */
Zillow.prototype.getDeepSearchResults = function(params) {
  var citystatezip = params.city + ', ' + params.state + ' ' + params.zip;

  var requestUrl = rootUrl + 'GetDeepSearchResults.htm?' +
    'zws-id=' + this.id + '&address=' + encodeURIComponent(params.address) +
    '&citystatezip=' + encodeURIComponent(citystatezip) +
    (params.rentzestimate ? params.rentzestimate : '');

  return helpers.httprequest(requestUrl)
    .then(helpers.toJson)
    .then(function(results) {
      var result = results['SearchResults:searchresults'];
      return result;
    });
};

/**
 * Carries out the getUpdatedPropertyDetails api call
 * @memberof Zillow
 *
 * @param {number} zpid = Zillow property id (can be a string or number)
 */
Zillow.prototype.getUpdatedPropertyDetails = function(zpid) {
  var requestUrl = rootUrl + 'GetUpdatedPropertyDetails.htm?' +
    'zws-id=' + this.id +
    '&zpid=' + zpid;

  return helpers.httprequest(requestUrl)
    .then(helpers.toJson)
    .then(function(results) {
      var result = results['UpdatedPropertyDetails:updatedPropertyDetails'];
      return result;
    });
};

/**
 * Carries out the getDemographics api call
 * @memberof Zillow
 *
 * @param {object} params - hash that takes address parameters
 */
Zillow.prototype.getDemographics = function(params) {
  var paramsString = helpers.toQueryString(params, this.id);

  var requestUrl = rootUrl + 'GetDemographics.htm?' + paramsString;

  return helpers.httprequest(requestUrl)
    .then(helpers.toJson)
    .then(function(results) {
      var result = results['Demographics:demographics'];
      return result;
    });
};

/**
 * Convenience method to make any Zillow Api call
 * @memberof Zillow
 *
 * @param {string} name of the api -- refer to the zillow api doc or the api-list.js
 * @param {object} params - object that takes parameters for call
 */
Zillow.prototype.callApi = function(apiName, params) {
  var that = this;
  return Promise.try(function()
  {
    if (!that.id)
      throw new Error('Missing the zws-id');

    helpers.checkParams(params, apiList[apiName].requiredParams);

    var paramsString = helpers.toQueryString(params, that.id);

    var requestUrl = rootUrl + apiName + '.htm?' + paramsString;

    var resultTag = apiList[apiName].resultTag;

    return helpers.httprequestProxy(requestUrl)
      .then(function(val) {
        //console.log(val);
        if (val && val.indexOf('api.recaptcha.net') !== -1) { // we are getting Zillow repatchas
          //TODO convert this to actually send back the captcha
          console.log(requestUrl);
          console.log(val);

          throw {message: 'Too many Zillow requests. Please try again later.', captcha: true};
        } else {
          return helpers.toJson(val)
            .then(function(results) {
              var result = results[resultTag];
              return result;
            });
        }
      }, function(err) {
        throw {message: 'Failed to make request.', error: err};
      });
  });
};

module.exports = Zillow;
