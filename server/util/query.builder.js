'use strict';

var helper = require('./helper');

function QueryBuilder(params) {
  this._searchData = {};
  this._baseParams = params;
  this._query = {};

  if (params.filterSearch) {
    var filterSearch = JSON.parse(params.filterSearch);
    if (filterSearch && filterSearch.predicateObject) {
      this._searchData = filterSearch.predicateObject;
    }
  }

  this.skip = Number(params.start) || 0;
  this.limit = Number(params.number);
  if (this.limit < 0) {
    this.limit = undefined;
  }

  if (!this._query.$and) {
    this._query.$and = [];
  }
}

QueryBuilder.prototype._get = function(path, defaultValue) {
  return _.get(this._searchData, path, _.get(this._baseParams, path, defaultValue));
};

QueryBuilder.prototype.andString = function(path) {
  var value = this._get(path);
  if (!_.isUndefined(value)) {
    this._query.$and.push(_.set({}, path, helper.wrapRegExp(value)));
  }
  return this;
};

QueryBuilder.prototype.andBoolean = function(path) {
  var value = this._get(path);
  if (!_.isUndefined(value)) {
    this._query.$and.push(_.set({}, path, Boolean(value)));
  }
  return this;
};

QueryBuilder.prototype.andNumber = function(path) {
  var value = this._get(path);
  if (!_.isUndefined(value)) {
    this._query.$and.push(_.set({}, path, Number(value)));
  }
  return this;
};

QueryBuilder.prototype.andListString = function(path) {
  var matchAll = this._get(path + '.matchAny.all');
  var items = this._get(path + '.matchAny.items', []);
  if (!matchAll && items.length) {
    this._query.$and.push(_.set({}, path, {$in: items}));
  }
  return this;
};

QueryBuilder.prototype.andListBoolean = function(path) {
  var matchAll = Boolean(this._get(path + '.matchAny.all'));
  var items = this._get(path + '.matchAny.items', []);
  if (!matchAll && items.length) {
    var $orPart = [];
    _.each(items, function(item) {
      if (item) {
        $orPart.push(_.set({}, path, true));
      } else {
        $orPart.push(_.set({}, path, false));
        $orPart.push(_.set({}, path, {$exists: false}));
      }
    });
    if ($orPart.length) {
      this._query.$and.push({$or: $orPart});
    }
//    this._query.$and.push(_.set({}, path, {$in: items}));
  }
  return this;
};

QueryBuilder.prototype.getQuery = function() {
  var q = _.clone(this._query);
  if (!q.$and.length) {
    delete q.$and;
  }
  return q;
};

module.exports = QueryBuilder;