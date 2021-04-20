import accounting from 'accounting';
import { format, parseISO } from 'date-fns';

accounting.settings.currency.precision = 0;

export default {
  bold: {
    transform: function (value) {
      return '<strong>' + value + '</strong>';
    },
  },
  booleanToYesNo: {
    transform: function(value) {
      return value ? 'Yes' : 'No';
    },
  },
  thousandsPlace: {
    transform: function(value) {
      var number = String(value).match(/\d+/)[0].replace(/(.)(?=(\d{3})+$)/g,'$1,');
      var label = String(value).replace(/[0-9]/g, '') || '';
      return number + ' ' + label;
    },
  },
  currency: {
    // a list of global objects this transform depends on
    globals: [ 'accounting' ],
    // this is the function that gets called to perform the transform
    transform: function (value, globals) {
      // var accounting = globals.accounting;
      return accounting.formatMoney(value);
    },
  },
  date: {
    transform: function (value) {
      let valueTransformed;
      // console.log('date transform running, value:', value, 'typeof value:', typeof value);
      if (typeof value === 'string') {
        valueTransformed = format(parseISO(value), 'MM/dd/yyyy');
      } else {
        valueTransformed = format(value, 'MM/dd/yyyy');
      }
      return valueTransformed;
    },
  },
  dayofweek: {
    // a list of global objects this transform depends on
    transform: function (value) {
      switch(value) {
      case "FRI":
        value = "Friday";
        break;
      case "SAT":
        value = "Saturday";
        break;
      case "SUN":
        value = "Sunday";
        break;
      case "MON":
        value = "Monday";
        break;
      case "TUE":
        value = "Tuesday";
        break;
      case "WED":
        value = "Wednesday";
        break;
      case "THU":
        value = "Thursday";
      }
      return value;
    },
  },
  feet: {
    transform: function (value) {
      return value && value + ' ft';
    },
  },
  getNearest: {
    transform: function(state, field, distName) {
      let min = Math.min.apply(null, state.sources[field].data.map(function(item) {
        return item[distName];
      }));
      let result  = state.sources[field].data.filter(function(item){
        return item[distName] == min;
      } );
      let nearest = result? result[0] : null;
      return nearest;
    },
  },
  integer: {
    transform: function (value) {
      return !isNaN(value) && parseInt(value);
    },
  },
  nowrap: {
    transform: function (value) {
      return '<span style="white-space: nowrap;">' + value + '</span>';
    },
  },
  nth: {
    transform: function(n) {
      console.log('nth transform, n:', n, 'n%100>>3^1&&n%10:', n%100>>3^1&&n%10);
      return n + ([ 'th', 'st','nd','rd' ][n%100>>3^1&&n%10]||'th');
    },
  },
  phoneNumber: {
    transform: function (value) {
      var s2 = (""+value).replace(/\D/g, '');
      var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
      return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
    },
  },
  prettyNumber: {
    transform: function (value) {
      return !isNaN(value) && value.toLocaleString();
    },
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
      var std = [ '(', m[1], ') ', m[3], '-', m[5] ].join('');
      var orig = m[0];
      var valueStd = value.replace(orig, std);

      return valueStd;
    },
  },
  squareFeet: {
    transform: function (value) {
      return value && value + ' sq ft';
    },
  },
  titleCase: {
    transform: function(str) {
      str = str.toLowerCase().split(' ').map(function(word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
      });
      return str.join(' ');
    },
  },
  urlFormatter: {
    transform: function(txt) {
      var uselessWordsArray =
        [
          "http//", "http://", "https://", "www.", "//", "//:",
        ];
      var expStr = uselessWordsArray.join("|");
      return txt.replace(new RegExp(expStr, 'gi'), '');
    },
  },
  i18nSubstitute: {
    transform: function(str) {
      let test = str.split('$t(');
      console.log('i18nSubstitute is running, str:', str, 'test:', test, 'this.$config.i18n', this.$config.i18n);
      return voting.topic.accessibilityCodes.informationNotAvailable;
    },
  },
};
