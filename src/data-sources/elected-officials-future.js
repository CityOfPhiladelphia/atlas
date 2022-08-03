export default {
  id: 'electedOfficialsFuture',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        // console.log(feature.properties.election_precinct);
        return "WITH split AS (SELECT * FROM splits WHERE precinct = '" + feature.properties.election_precinct + "') \
                SELECT eo.*, s.ballot_file_id\
                FROM elected_officials eo, split s \
                WHERE eo.office = 'city_council' AND eo.district = s.city_district_new \
                ";
      },// + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'",
    },
  },
};
