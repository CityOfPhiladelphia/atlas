export default {
  id: 'liBusinessLicenses',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        // if there is no eclipse_location_id, return a query that will definitely return nothing (or it will return many)
        if (feature.properties.eclipse_location_id === null || feature.properties.eclipse_location_id === '') {
          return "select * from business_licenses where addressobjectid in (" + null + ")";
        }
        var eclipseLocId = feature.properties.eclipse_location_id.split('|');
        var str = "";
        var i;
        for (i = 0; i < eclipseLocId.length; i++) {
          str += eclipseLocId[i];
          str += ", ";
        }
        str = str.slice(0, str.length - 3);

        return "select * from business_licenses where addressobjectid in (" + str + ")";
      },
    },
  },
};
