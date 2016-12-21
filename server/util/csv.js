
var config = require('../config/environment');
var Baby = require('babyparse');
var _ = require('lodash');

var csvPath = config.root + '/docs/2.3-PriceGuide-201617-VIC-NSW-QLD-TAS_Proposed2.csv';

var babyParseOptions = {
//    header: true,
  dynamicTyping: true,
  skipEmptyLines: true
};


var parsed = Baby.parseFiles(csvPath, babyParseOptions);


console.log(parsed.data[0]);
//parsed.data[0].splice(1, 0, 'Support Item ID');


var supportItems = _.chain(parsed.data.slice(1)).map((i) => _.trim(i[1])).uniq().value();

console.log(supportItems);

_.each(parsed.data, function(item, key) {
  if (!key) {
    item.splice(1, 0, 'Support Item ID');
  } else {
    _.each(item, function(column, key) {
      item[key] = _.trim(item[key]);
    });
    var index = supportItems.indexOf(item[1]);
    if (index === -1 || !item[1]) {
      index = -1;
    }
    item.splice(1, 0, (index + 1) * 10);
  }
});


//console.log(parsed.data.slice(0, 10));

var csvPathNew = config.root + '/docs/2.3-PriceGuide-201617-VIC-NSW-QLD-TAS_Proposed.csv';
var str = Baby.unparse(parsed);
console.log(str.substr(0, 2000));
var fs = require('fs');
fs.writeFileSync(csvPathNew, str, 'utf8');



