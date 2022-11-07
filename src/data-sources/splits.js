export default {
  id: 'electedOfficials',
  type: 'http-get',
  // url: 'https://phl.carto.com/api/v2/sql',
  url: '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/SPLITS/FeatureServer/0/query',
  options: {
    params: {
      where: function(feature) {
        console.log('splits function, feature:', feature);
        return "PRECINCT = '" + feature.properties.election_precinct + "'";
      },
      outfields: '*',
      f: 'json',
      // q: function(feature){
      //   // console.log(feature.properties.election_precinct);
      //   return "WITH split AS (SELECT * FROM splits WHERE precinct = '" + feature.properties.election_precinct + "') \
      //           SELECT eo.*, s.ballot_file_id\
      //           FROM elected_officials eo, split s \
      //           WHERE eo.office = 'city_council' AND eo.district = s.city_district \
      //                     OR eo.office = 'state_house' AND eo.district = s.state_house \
      //                     OR eo.office = 'state_senate' AND eo.district = s.state_senate \
      //                     OR eo.office = 'us_house' AND eo.district = s.federal_house \
      //           ";
      // },// + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'",
    },
    success: function(data) {
      console.log('splits.js success, data:', data);
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
