/*  dsv-loader: a dsv loader for webpack
    built using dsv by Mike Bostock */

var loaderUtils = require('loader-utils');
var dsvFormat = require('d3-dsv').dsvFormat;


var rowFormat = function(rowValues, rowIndex, columnNames) {
  var result = {};
  for (var i = 0; i < columnNames.length; i++) {
    var columnName = columnNames[i];
    var value = rowValues[columnName];
    if (typeof value === 'string') {
      // Read numbers
      if (value.match(/^-?[0-9\.]+$/)) {
        result[columnName] = JSON.parse(value);
        continue;
      }
      // Read strings as strings without wrapping ' ' or " "
      var stringMatch = value.match(/^('(.*)')|("(.*)")$/);
      if (stringMatch) {
        result[columnName] = stringMatch[2] || stringMatch[4];
        continue;
      }
      // Read booleans
      const lowercaseValue = value.toLowerCase();
      if (lowercaseValue === 'true') {
        result[columnName] = true;
        continue;
      }
      if (lowercaseValue === 'false') {
        result[columnName] = false;
        continue;
      }
      // Read null / undefined
      if (lowercaseValue === 'null') {
        result[columnName] = null;
        continue;
      }
    }
    result[columnName] = value;
  }
  return result;
};


module.exports = function(text) {
  this.cacheable();

  var query = loaderUtils.parseQuery(this.query);
  var delimiter = query.delimiter || ',';
  var dsv = dsvFormat(delimiter);
  var rows = query.rows;
  var res = rows ? dsv.parseRows(text, rowFormat) : dsv.parse(text, rowFormat);

  return (
    'var res = ' + JSON.stringify(res) + ';' +
    'res.columns = ' + JSON.stringify(res.columns) + ';' +
    'module.exports = res;'
  );
}
