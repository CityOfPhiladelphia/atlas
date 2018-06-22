import accounting from 'accounting';
import moment from 'moment';

accounting.settings.currency.precision = 0;

export default {
  currency: {
    // a list of global objects this transform depends on
    globals: ['accounting'],
    // this is the function that gets called to perform the transform
    transform: function (value, globals) {
      // var accounting = globals.accounting;
      return accounting.formatMoney(value);
    }
  },
  date: {
    globals: ['moment'],
    transform: function (value, globals) {
      // var moment = globals.moment;
      return moment(value).format('MM/DD/YYYY');
    },
  },
  phoneNumber: {
    transform: function (value) {
      var s2 = (""+value).replace(/\D/g, '');
      var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
      return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
    }
  },
  rcoPrimaryContact: {
    transform: function (value) {
      var PHONE_NUMBER_PAT = /\(?(\d{3})\)?( |-)?(\d{3})(-| )?(\d{4})/g;
      var m = PHONE_NUMBER_PAT.exec(value);

      // check for non-match
      if (!m) {
        return value;
      }

      // standardize phone number
      var std = ['(', m[1], ') ', m[3], '-', m[5]].join('');
      var orig = m[0]
      var valueStd = value.replace(orig, std);

      return valueStd;
    }
  },
  booleanToYesNo: {
    transform: function(value) {
      return value ? 'Yes' : 'No';
    }
  },
  integer: {
    transform: function (value) {
      return !isNaN(value) && parseInt(value);
    },
  },
  prettyNumber: {
    transform: function (value) {
      return !isNaN(value) && value.toLocaleString();
    },
  },
  feet: {
    transform: function (value) {
      return value && value + ' ft';
    },
  },
  squareFeet: {
    transform: function (value) {
      return value && value + ' sq ft';
    },
  },
  nowrap: {
    transform: function (value) {
      return '<span style="white-space: nowrap;">' + value + '</span>';
    },
  },
  bold: {
    transform: function (value) {
      return '<strong>' + value + '</strong>';
    },
  },
}
