export default {
  id: 'electedOfficials',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        // console.log(feature.properties.election_precinct);
        return "WITH split AS (SELECT * FROM splits WHERE precinct = '"+feature.properties.election_precinct+"') SELECT eo.* FROM elected_officials eo, \
                split s WHERE eo.office = 'city_council' AND eo.district = s.city_district \
                           OR eo.office = 'state_house' AND eo.district = s.state_house \
                           OR eo.office = 'state_senate' AND eo.district = s.state_senate \
                           OR eo.office = 'us_house' AND eo.district = s.federal_house \
                ";
      },// + "' or addresskey = '" + feature.properties.li_address_key.toString() + "'",
    }
  }
}



// with split as (
// select * from splits where precinct = 0720
// )
// select eo.*
// from elected_officials eo, split s
// where eo.office = 'city_council' and eo.district = s.city_district
//  or eo.office = 'state_house' and eo.district = s.state_house
//  or eo.office = 'state_senate' and eo.district = s.state_senate
//  or eo.office = 'us_house' and eo.district = s.federal_house
