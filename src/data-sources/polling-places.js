export default {
  id: 'pollingPlaces',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        return "select ST_X(the_geom) as lng, ST_Y(the_geom) as lat, * from polling_places where precinct = '" + feature.properties.election_precinct + "'";
      },
    },
  },
};
