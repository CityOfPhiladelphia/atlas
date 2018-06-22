export default {
  id: 'elections',
  url: 'https://api.phila.gov/pollingtest',
  type: 'http-get',
  options: {
    params: {
      option: 'com_pollingplaces',
      view: 'json',
      ward: function(feature) {
        if (feature.properties.election_precinct !== '') {
          return feature.properties.election_precinct.slice(0,2);
        } else {
          return feature.properties.political_division.slice(0,2);
        }
      },
      division: function(feature) {
        if (feature.properties.election_precinct !== '') {
          return feature.properties.election_precinct.slice(2,4);
        } else {
          return feature.properties.political_division.slice(2,4);
        }
      }
    },
    success(data) {
      return data;
    }
  }
}
