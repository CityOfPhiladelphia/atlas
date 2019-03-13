export default {
  id: 'liBusinessLicenses',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        var eclipseLocId = feature.properties.eclipse_location_id.split('|');
        var str = "'";
        var i;
        for (i = 0; i < eclipseLocId.length; i++) {
          str += eclipseLocId[i]
          str += "', '"
        }
        str = str.slice(0, str.length - 3);
        return "select * from li_business_licenses where eclipse_addressobjectid in (" + str + ")"
      },
    }
  }
}
