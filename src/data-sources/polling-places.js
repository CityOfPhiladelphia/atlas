export default {
  id: 'pollingPlaces',
  type: 'http-get',
  url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/POLLING_PLACES/FeatureServer/0/query',
  options: {
    params: {
      where: function(feature) {
        return "PRECINCT = '" + feature.properties.election_precinct + "'";
      },
      outSR : '4326',
      outfields: '*',
      // outFields: "WARD, DIVISION, PRECINCT, PLACENAME,\
      //             STREET_ADDRESS, ZIP_CODE, ACCESSIBILITY_CODE, PARKING_CODE,\
      //             LAT, LON",
      returnDistinctValues: 'true',
      returnGeometry: 'true',
      f: 'json',
    },
    success: function(data) {
      console.log('polling-places.js success, data:', data);
      let features;
      if (data.features[0]) {
        // features = data.features[0].attributes;
        features = data.features[0];
      } else {
        features = null;
      }
      return features;
    },
  },
};
