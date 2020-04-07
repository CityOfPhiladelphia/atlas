export default {
  id: 'liViolations',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        var eclipseLocId = feature.properties.eclipse_location_id.split('|');
        var str = "'" + feature.properties.li_address_key + "', '";
        var i;
        for (i = 0; i < eclipseLocId.length; i++) {
          str += eclipseLocId[i];
          str += "', '";
        }
        str = str.slice(0, str.length - 3);

        return "select * from violations where address = '" + feature.properties.street_address + "' or addressobjectid in (" + str + ")";
      },
    },
  },
};
