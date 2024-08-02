export default {
  id: 'electionSplits',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        // console.log(feature.properties.election_precinct);
        if (feature.properties.election_precinct) {
          return "SELECT * FROM splits WHERE precinct = '" + feature.properties.election_precinct + "'";
        } else if (feature.properties.political_division) {
          return "SELECT * FROM splits WHERE precinct = '" + feature.properties.political_division + "'";
        }
      },
    },
  },
};
