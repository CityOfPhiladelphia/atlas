export default {
  id: 'liViolations',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        // return "select * from li_violations where address = '" + feature.properties.street_address + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'";
        return "select * from violations where opa_account_num = '" + feature.properties.opa_account_num + "'";
      },
    },
  },
};
