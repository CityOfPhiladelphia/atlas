/* global _, app */

app.util = (function () {
  return {
    serializeQueryStringParams: function (obj) {
      var _str = [];
      for(var p in obj) {
        if (obj.hasOwnProperty(p)) {
          _str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
        }
      }
      return _str.join('&');
    },

    // lat lon coords => x y coords
    flipCoords: function (coords) {
      var a = coords[0],
          b = [];
      for (var i = 0; i < a.length; i++) {
        b[i] = []
        b[i][0] = a[i][1]
        b[i][1] = a[i][0]
      }
      return b;
    },
    
    // clean up various types of whitespace/null values in dor
    cleanDorAttribute: function (attr) {
      // trim leading and trailing whitespace
      var cleanAttr = attr ? String(attr) : '';
      cleanAttr = cleanAttr.replace(/\s+/g, '');
      
      // return null for zeros and empty strings
      if (['', '0'].indexOf(cleanAttr) > -1) {
        return null;
      }
      
      return cleanAttr;
    },
    
    // takes an array of geojson features, returns a string of concatenated <tr> elements
    makeTableRows: function (rows, fields) {
      // loop over rows
      var rowsHtml =  _.map(rows, function (row) {
        var props = row.properties;
        // loop over fields
        var valsHtml = _.map(fields, function (field) { 
          var val = props[field];
          return '<td>' + val + '</td>';
        }).join('');
        return '<tr>' + valsHtml + '</tr>';
      }).join('');
      
      return rowsHtml;
    },
  };
}());
