export default {
  id: 'nextElectionAPI',
  type: 'http-get',
  // url: 'https://apis.philadelphiavotes.com/election',
  url: 'https://admin-vote.phila.gov/wp-json/votes/v1/election',
  options: {
  },
  success: function(data) {
    return data;
  },
};
