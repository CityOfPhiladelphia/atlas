export default {
  id: 'electionSplits',
  type: 'http-get',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    params: {
      q: function(feature){
        // console.log(feature.properties.election_precinct);
        return "SELECT * FROM splits WHERE precinct = '" + feature.properties.election_precinct + "'";
      },
    },
  },
};
