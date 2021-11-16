export default {
  id: 'zoningDocsEclipse',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature) {

        if (feature.properties.eclipse_location_id === null || feature.properties.eclipse_location_id === '') {
          return "select * from li_zoning_docs where address_objectid in (" + null + ")";
        }
        var eclipseLocId = feature.properties.eclipse_location_id.split('|');
        var str = "'";
        var i;
        for (i = 0; i < eclipseLocId.length; i++) {
          str += eclipseLocId[i];
          str += "', '";
        }
        str = str.slice(0, str.length - 3);

        return "select * from li_zoning_docs where address_objectid in (" + str + ")";
      },
    },
  },
};
