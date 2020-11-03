export default {
  id: 'electedOfficials',
  type: 'http-get',
  // type: 'esri',
  // dependent: 'pollingPlacesSplits',
  deps: [ 'sources.pollingPlacesSplits' ],
  url: 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/ArcGIS/rest/services/elected_officials/FeatureServer/0/query',
  options: {
    params: {
      where: function(feature, state){
        console.log('in elected-officials-ago, state.sources.pollingPlacesSplits.data[0]:', state.sources.pollingPlacesSplits.data[0], 'feature:', feature.properties.election_precinct);
        // return "PRECINCT = '" + feature.properties.election_precinct + "'";
        // return "WITH split AS (SELECT * FROM splits WHERE precinct = '" + feature.properties.election_precinct + "') \
        //         SELECT eo.*, s.ballot_file_id\
        //         FROM elected_officials eo, split s \
        let query = "OFFICE = 'city_council' AND DISTRICT = '" + state.sources.pollingPlacesSplits.data[0].attributes.CITY_DISTRICT + "'\
          OR OFFICE = 'state_house' AND DISTRICT = '" + state.sources.pollingPlacesSplits.data[0].attributes.STATE_HOUSE + "'\
          OR OFFICE = 'state_senate' AND DISTRICT = '" + state.sources.pollingPlacesSplits.data[0].attributes.STATE_SENATE + "'\
          OR OFFICE = 'us_house' AND DISTRICT = '" + state.sources.pollingPlacesSplits.data[0].attributes.FEDERAL_HOUSE + "'\
          ";
        // OR eo.office = 'state_house' AND eo.district = s.state_house \
        // OR eo.office = 'state_senate' AND eo.district = s.state_senate \
        // OR eo.office = 'us_house' AND eo.district = s.federal_house \
        return query;
      },
      outFields: "*",
      // outSR: 4326,
      // outFields: "R_NUM, DISPLAY_DATE, DOCUMENT_TYPE, GRANTORS, GRANTEES",
      // returnDistinctValues: 'true',
      // returnGeometry: 'true',
      f: 'json',
      sqlFormat: 'standard',
    },
    success: function(data) {
      console.log('in elected-officials-ago success, data:,', data);
      return data.features;
      // return data.rows;
    },
  },
};
