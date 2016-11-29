/* global _, moment, app */

app.util = (function () {
  return {
    serializeQueryStringParams: function (obj) {
      var _str = [];
      for (var p in obj) {
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
    makeTableRowsFromGeoJson: function (rows, fields) {
      // loop over rows
      var rowsHtml =  _.map(rows, function (row) {
        var props = row.properties;
        // loop over fields
        var valsHtml = _.map(fields, function (field) {
          var val = props[field] || '';

          // truncate long strings
          if ((typeof val === 'string' || val instanceof String) && val.length > 150) {
            val = val.substr(val, 150) + '...';
          }

          return '<td>' + val + '</td>';
        }).join('');
        return '<tr>' + valsHtml + '</tr>';
      }).join('');

      return rowsHtml;
    },

    // takes an array of flat json features, returns a string of concatenated <tr> elements
    makeTableRowsFromJson: function (rows, fields) {
      // loop over rows
      var rowsHtml =  _.map(rows, function (row) {
        // loop over fields
        var valsHtml = _.map(fields, function (field) {
          // if a function is passed in, run it against the row
          if (typeof field === 'function') {
            val = field(row);
          }
          else {
            var val = row[field] || '';
          }

          // truncate long strings
          if ((typeof val === 'string' || val instanceof String) && val.length > 150) {
            val = val.substr(val, 150) + '...';
          }

          // TEMP format iso dates
          // if (field.indexOf('date') > -1) {
          //   val = moment(val).format('YYYY-MM-DD');
          // }
          // else {
          //   console.log('not date', field);
          // }

          return '<td>' + val + '</td>';
        }).join('');
        return '<tr>' + valsHtml + '</tr>';
      }).join('');

      return rowsHtml;
    },

    // takes a dor parcel object (geojson response) and creates the full,
    // concatenated street address
    concatDorAddress: function (obj) {
      var ADDRESS_FIELDS = ['HOUSE', 'SUFFIX', 'STDIR', 'STNAM', 'STDES', 'STDESSUF'],
          props = obj.properties,
          // clean up attributes
          comps = _.map(_.pick(props, ADDRESS_FIELDS), app.util.cleanDorAttribute),
          // TODO handle individual address comps (like mapping stex=2 => 1/2)
          // addressLow = comps.HOUSE,
          // addressHigh = comps.STEX,
          // streetPredir = comps.STDIR,
          // streetName = comps.STNAM,
          // streetSuffix = comps.STDES,
          // streetPostdir = comps.STDESSUF,

          // remove nulls and concat
          address = _.compact(comps).join(' ');

      return address;
    },

    FIELD_TRANSFORMS: {
      currency: function (val) {
        return accounting.formatMoney(val);
      },
      date: function (val) {
        // check for epoch dates
        if (!isNaN(val)) val = parseInt(val);
        var newVal = moment(val).format('YYYY-MM-DD');
        return newVal;
      },
      // 'epoch-date': function (val) {
      //   console.log('is num', !isNaN(val));
      //   valInt = parseInt(val);
      //   return app.util.FIELD_TRANSFORMS.date(valInt);
      // },
      'li-permit-id': function (val) {
        var url = '//li.phila.gov/#details?entity=permits&eid=' + val;
        return '<a href="' + url + '">' + val + '</a>';
      },
      'li-inspection-id': function (val) {
        // var url = '//li.phila.gov/#details?entity=permits&eid=' + val;
        // return '<a href="' + url + '">' + val + '</a>';
        return val;
      },
      'li-violation-id': function (val) {
        // var url = '//li.phila.gov/#details?entity=violationdetails&eid=' + val;
        // return '<a href="' + url + '">' + val + '</a>';
        return val;
      },
      'zoning-appeal-id': function (val) {
        var url = '//li.phila.gov/#details?entity=zoningboardappeals&eid=' + val;
        return '<a href="' + url + '">' + val + '</a>';
      },
      'zoning-document-link': function (val) {
        return '<a href="' + val + '">View Scan</a>';
      },
      'distance': function (val) {
        return Math.round(val) + ' feet';
      },
    },

    // given an array of fields (table cells), update text using transform
    _updateTableFields: function (fields, transform) {
      _.forEach(fields, function (field) {
        var $field = $(field),
            val = $field.text(),
            newVal = transform(val);
        $field.html(newVal);
      });
    },

    _formatVerticalTableFields: function ($table) {
      // loop over transforms
      _.forEach(app.util.FIELD_TRANSFORMS, function (transform, fieldType) {
        // loop over fields
        var fields = $table.find('th[data-field-type=' + fieldType + ']').next();
        app.util._updateTableFields(fields, transform);
      });
    },

    _formatHorizontalTableFields: function ($table) {
      // loop over transforms
      _.forEach(app.util.FIELD_TRANSFORMS, function (transform, fieldType) {
        // loop over columns
        var cols = $table.find('th[data-field-type=' + fieldType + ']');
        _.forEach(cols, function (col) {
          // get the col's index
          var $col = $(col),
              index = $col.index(),
          // get all cells at that index. for some reason these nth-children
          // seem to be indexed from 1, not 0 (??)
              fields = $table.find('td:nth-child(' + (index + 1) + ')');
          app.util._updateTableFields(fields, transform);
        });
      });
    },

    // format table fields
    formatTableFields: function ($table) {
      // determine if it's a vertical or horizontal table
      var hasThead = $table.find('thead').length > 0,
          orientation = hasThead ? 'Horizontal' : 'Vertical';
          fnName = '_format' + orientation + 'TableFields';

      // call more specific format function
      app.util[fnName]($table);
    },

    constructHash: function (address, topic) {
      if (!address) {
        console.log('construct hash, but no address');
        return;
      }
      var comps = ['#', encodeURIComponent(address)];
      if (topic) comps.push(encodeURIComponent(topic));
      var hash = comps.join('/');
      return hash;
    },

    getQueryParams: function () {
      var search = location.search,
          searchTrimmed = search.substr(1),
          pairs = searchTrimmed.split('&'),
          params = {};
      _.forEach(pairs, function (pair) {
        var comps = pair.split('='),
            key = comps[0],
            value = decodeURIComponent(comps[1]);
        params[key] = value;
      });
      return params;
    },

    slugify: function (text) {
      return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
    },

    filterJsonByTimeframe: function (rows, dateField, daysBack) {
      var minDate = moment().subtract(daysBack, 'days');
      return _.filter(rows, function (row) {
        var rowDateRaw = row[dateField];
        if (!rowDateRaw) return;
        var rowDate = moment(rowDateRaw);
        return minDate < moment(rowDate);
      });
    },

    addIdsToRows: function (rows) {
      return _.map(rows, function (row, i) {
        var rowWithId = Object.assign({}, row);
        rowWithId.id = i;
        return rowWithId;
      });
    },
  };
}());
