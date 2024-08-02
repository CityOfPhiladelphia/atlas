export default {
  id: 'pollingPlaces',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        if (feature.properties.election_precinct) {
          return "select ST_X(the_geom) as lng, ST_Y(the_geom) as lat, * from polling_places where precinct = '" + feature.properties.election_precinct + "'";
        } else if (feature.properties.political_division) {
          return "select ST_X(the_geom) as lng, ST_Y(the_geom) as lat, * from polling_places where precinct = '" + feature.properties.political_division + "'";
        }
      },
    },
  },
};
