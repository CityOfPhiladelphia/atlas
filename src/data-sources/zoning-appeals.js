export default {
  id: 'zoningAppeals',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature) {
        var stmt = "select * from li_appeals where address = '" + feature.properties.street_address + "'";
        var addressKey = feature.properties.li_address_key;

        if (addressKey && addressKey.length > 0) {
          stmt += " or addresskey = '" + feature.properties.li_address_key.toString() + "'";
        }

        return stmt;
      },
    },
  },
};
