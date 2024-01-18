export default {
  id: 'electedOfficials',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        // console.log(feature.properties.election_precinct);
        return "WITH split AS (SELECT * FROM splits WHERE precinct = '" + feature.properties.election_precinct + "') \
                SELECT eo.*, s.ballot_file_id\
                FROM elected_officials eo, split s \
                WHERE eo.office = 'city_council' AND eo.district = '" + feature.properties.council_district_2024 + "' \
                          OR eo.office = 'state_house' AND eo.district = s.state_house \
                          OR eo.office = 'state_senate' AND eo.district = s.state_senate \
                          OR eo.office = 'us_house' AND eo.district = s.federal_house \
                ";
      },// + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'",
    },
  },
};
