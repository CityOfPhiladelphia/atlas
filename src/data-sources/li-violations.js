export default {
  id: 'liViolations',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        var eclipseLocId = feature.properties.eclipse_location_id.split('|');
        var str = "'";
        var i;
        for (i = 0; i < eclipseLocId.length; i++) {
          str += eclipseLocId[i];
          str += "', '";
        }
        str = str.slice(0, str.length - 3);

        // return "select * from violations where address = '" + feature.properties.street_address + "' or addressobjectid = '" + feature.properties.li_address_key.toString() + "'";
        return "select * from violations where address = '" + feature.properties.street_address + "' or (addressobjectid = '" + feature.properties.li_address_key.toString() + "' and systemofrecord = 'HANSEN') or (addressobjectid in (" + str + ")" + " and systemofrecord = 'ECLIPSE')";
        // return "select * from li_violations where address = '" + feature.properties.street_address + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'";
        // return "select * from violations where opa_account_num = '" + feature.properties.opa_account_num + "'";
      },
    },
  },
};
