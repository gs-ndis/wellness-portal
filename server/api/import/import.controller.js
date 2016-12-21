'use strict';

var config = require('../../config/environment');
var errorSender = require('../../util/errorSender');
var fs = Promise.promisifyAll(require('fs'));
var Baby = require('babyparse');
var path = require('path');
var SupportItem = require('../supportItem/support.item.model');
var Variant = require('../variant/variant.model');
var mongoose = require('mongoose');
var Content = require('../content/content.model');
var iconv = require('iconv-lite');

var client = require('../../util/contentful.management.client');


var updateSupportItemType = Promise.method(function(space, supportCategories, registrationGroups) {
  console.log('update supportItem');
  return space.getContentType('supportItem').then(function(supportItem) {
    var categoryField = _.find(supportItem.fields, {id: 'category'});
    categoryField.validations = [{in: supportCategories}];

    var registrationGroupField = _.find(supportItem.fields, {id: 'registrationGroup'});
    registrationGroupField.validations = [{in: registrationGroups}];
    return supportItem.update();
  });

});

var createSupportItemEntry = Promise.method(function(supportItemData) {
  console.log('create supportItem...');
  return client.getSpace(config.contentful.space).then(function(space) {
    return space.createEntry('supportItem', supportItemData);
  });
});

var createOrUpdateSupportItemEntry = Promise.method(function(space, supportItemData) {
  var data = _.cloneDeep(supportItemData);

  console.log('create supportItem...');
//  return client.getSpace(config.contentful.space).then(function(space) {
  var supportItemId = Number(_.get(supportItemData, 'fields.supportItemId', 0));
  if (!supportItemId) {
    return Promise.resolve();
//      return space.createEntry('supportItem', supportItemData);
  }
  return Content.findOne({'sys.contentType.sys.id': 'supportItem', 'fields.supportItemId': supportItemId}).then(function(supportItem) {
    if (supportItem) {
      return space.getEntry(supportItem.sys.id).then(function(content) {
        delete data.fields.description;
        delete data.fields.title;
        _.extend(content.fields, data.fields);
        return content.update();
      });
    }
    return space.createEntry('supportItem', supportItemData);
  });
//  });
});


exports.updateLocal = function(req, res) {
  var locations = [
    'ACT',
    'NSW',
    'QLD',
    'VIC',
    'TAS',
    'Remote',
    'Very Remote'
  ];

  var resourcesDir = config.root + '/resources/csv/';

  var files = [{
      path: resourcesDir + '201617-ACT-PG.csv',
      location: ['ACT']
    }, {
      path: resourcesDir + '201617-Remote-PG.csv',
      location: ['Remote']
    }, {
      path: resourcesDir + '201617-Very-Remote-PG.csv',
      location: ['Very Remote']
    }, {
      path: resourcesDir + '201617-VIC-NSW-QLD-TAS-Price-Guide.csv',
      location: ['VIC', 'NSW', 'QLD', 'TAS']
    }
  ];

  var sampleCsvPath = config.root + '/docs/2.3-PriceGuide-201617-VIC-NSW-QLD-TAS_Proposed.csv';

  var babyParseOptions = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true
  };

//  fs.readdirAsync(resourcesDir).then(function(files) {
  Promise.resolve().then(function() {
    return Variant.remove({}).exec();
  }).then(function() {
    return Promise.map(files, function(csv) {
      return fs.readFileAsync(csv.path).then(function(buffer) {
        var str = iconv.decode(buffer, 'cp1250');
        csv.parsed = Baby.parse(str, babyParseOptions);
        return csv;
      });
    });
  }).then(function(parsedFiles) {
    var parsed = Baby.parseFiles(sampleCsvPath, babyParseOptions);
//    console.log('-------------+++', parsed.data.length);
    var indexed = _.keyBy(parsed.data, 'Variant ID');
    return Promise.reduce(parsedFiles, function(result, parsedFile) {
      var data = _.keyBy(parsedFile.parsed.data, 'Support Item Number');
      _.each(data, function(item, key) {
        if (result[key]) {
          if (!result[key].priceCap) {
            result[key].priceCap = [];
          }
          var price = Number(String(item.Price).replace(/[^\d\.]*/ig, ''));
          if (price > 0) {
            result[key].priceCap.push({location: parsedFile.location, price: price});
          }
        }
      });
      return result;
    }, indexed);
  }).then(function(result) {

    console.log('-------------------------', _.size(result));
//    console.log(JSON.stringify(_.chain(result).filter('Price').take(5).value(), null, 2));
//    console.log('-------------------------');
    return Promise.each(_.map(result), function(variantData) {
      var data = {
        variantId: _.trim(variantData['Variant ID']),
        description: _.trim(variantData['Variant Description']),
        unit: _.trim(variantData['Unit of Measure']),
//        price: Number(String(variantData.Price).replace(/[^\d\.]*/ig, '')),
        priceCap: variantData.priceCap,
        supportItemId: Number(variantData['Support Item ID']) || undefined
      };
//      return Variant.findOne({variantId})
      var newVariant = new Variant(data);
      return newVariant.save();
    });
  }).then(function() {
    res.send(200);
  });
};



exports.updateContentful = function(req, res) {
  var csvPath = path.normalize(config.root + '/docs/2.3-PriceGuide-201617-VIC-NSW-QLD-TAS_Proposed.csv');
  var options = {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true
  };
  var parsed = Baby.parseFiles(csvPath, options);
  var supportItemsGroups = _.groupBy(parsed.data, 'Support Item');

  var registrationGroups = _.chain(parsed.data).map('Registration Group').map(_.trim).uniq().compact().value();
  var supportCategories = _.chain(parsed.data).map('Support Categories').map(_.trim).uniq().compact().value();

  console.log(registrationGroups);
  console.log('---------------------');
  console.log(supportCategories);
  var space;
  client.getSpace(config.contentful.space).then(function(result) {
    space = result;
    return updateSupportItemType(space, supportCategories, registrationGroups);
  }).then(function() {
    console.log('next...');


    return Promise.each(_.keys(supportItemsGroups), function(key) {
      if (!key.length) {
        return;
      }
      var item = _.head(supportItemsGroups[key]);

      var priceControlled = false;
      _.each(supportItemsGroups[key], function(variant) {
        if (_.trim(variant['Price Control']) && (_.trim(variant['Price Control']).toUpperCase() === 'Y' || Number(variant.Price) > 0)) {
          priceControlled = true;
          return false;
        }
      });
      var quoteNeeded = false;
      _.each(supportItemsGroups[key], function(variant) {
        if (_.trim(variant.Quote) && _.trim(variant.Quote).toUpperCase() === 'Y') {
          quoteNeeded = true;
          return false;
        }
      });
      var description = _.chain(supportItemsGroups[key]).map('Support Item Description').map(_.trim).uniq().compact().join(' | ').value();
      if (!description || !description.length) {
        _.each(supportItemsGroups[key], function(variant) {
          if (_.trim(variant['Variant Description'])) {
            description = _.trim(variant['Variant Description']);
            return false;
          }
        });
        console.log('++++++++++++++++++++++variant description', description);
      }

      if (!description || !description.length) {
        console.log('description is empty', key, supportItemsGroups[key]);
      } else if (description.indexOf('|') !== -1) {
//        console.log('combined description', description);
      }

      var supportItemData = {
        fields: {
          supportItemId: {'en-US': Number(item['Support Item ID'])},
          title: {'en-US': _.trim(key)},
          category: {'en-US': _.trim(item['Support Categories'])},
          registrationGroup: {'en-US': _.trim(item['Registration Group'])},
          description: {'en-US': description},
          priceControlled: {'en-US': priceControlled},
          quoteNeeded: {'en-US': quoteNeeded}
        }
      };
      console.log('---------------------', priceControlled, quoteNeeded);
//      console.log(supportItemData);
      return createOrUpdateSupportItemEntry(space, supportItemData);
    });
//    return Variant.remove({}).exec();
  }).then(function() {
    console.log('done...');
    res.send(200);
  });





//  if (true) {
//    res.send(200);
//    return;
//  }
//
//  var newSupportItems = [];
//  var newVariants = [];
//  _.each(supportItemsGroups, function(supportItemGroup, key) {
//    if (!key.length) {
//      return;
//    }
//    var firstItem = _.head(supportItemGroup);
//    var newSupportItem = new SupportItem({
//      name: _.trim(key),
//      registrationGroup: _.trim(firstItem['Registration Group']),
//      description: _.trim(firstItem['Support Item Description']),
//      category: _.trim(firstItem['Support Categories'])
//    });
//
//    newSupportItems.push(newSupportItem);
//    _.each(supportItemGroup, function(variant) {
//      var newVariant = new Variant({
//        variantId: variant['Variant ID'],
//        description: variant['Variant Description'],
//        unit: variant['Unit of Measure'],
//        price: Number((variant.Price + '').replace(',', '')),
//        _supportItem: newSupportItem
//      });
//      newVariants.push(newVariant);
//      newSupportItem.variants.push(newVariant);
//    });
//
//    var priceControlled = _.keys(_.groupBy(supportItemGroup, 'Price Control'));
//    var quoteNeeded = _.keys(_.groupBy(supportItemGroup, 'Quote'));


//    if (priceControlled.length > 1) {
//      console.log('------------------', key);
//      console.log('Price Control', priceControlled);
//      console.log('Quote', quoteNeeded);
//      console.log(supportItemGroup);
//      console.log('------------------');
//    }
//  });



//  res.send(200);




//  Promise.each(_.concat(newVariants, newSupportItems), function(item) {
//    return item.save();
//  }).then(function() {
//    res.send(200);
//  }).catch(function(err) {
//    console.error(err);
//    res.json(500, err);
//  });
}
