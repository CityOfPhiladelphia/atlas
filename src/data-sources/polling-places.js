export default {
id: 'pollingPlaces',
 type: 'http-get',
 url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/POLLING_PLACES/FeatureServer/0/query',
 options: {
   params: {
     where: function(feature) {
       return "PRECINCT = '" + feature.properties.election_precinct + "'";
     },
     outFields: "WARD, DIVISION, PRECINCT, PLACENAME,\
                 STREET_ADDRESS, ZIP_CODE, ACCESSIBILITY_CODE, PARKING_CODE,\
                 LAT, LON",
     returnDistinctValues: 'true',
     returnGeometry: 'false',
     f: 'json'
   },
   success: function(data) {
     // console.log('polling-places.js success, data:', data);
     if (data.features[0]) {
       return data.features[0].attributes;
     } else {
       return null;
     }
   },
 }
}
