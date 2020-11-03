export default {
  id: 'pollingPlaces',
  type: 'http-get',
  url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/polling_places/FeatureServer/0/query',
  options: {
    params: {
      where: function(feature){
        return "PRECINCT = '" + feature.properties.election_precinct + "'";
      },
      outFields: "*",
      outSR: 4326,
      // outFields: "R_NUM, DISPLAY_DATE, DOCUMENT_TYPE, GRANTORS, GRANTEES",
      returnDistinctValues: 'true',
      returnGeometry: 'true',
      f: 'json',
      sqlFormat: 'standard',
    },
    success: function(data) {
      return data.features;
      // return data.rows;
    },
  },
};
