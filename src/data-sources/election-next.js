export default {
  id: 'nextElectionAPI',
  type: 'http-get',
  url: 'https://apis.philadelphiavotes.com/election',
  options: {
  },
  success: function(data) {
    return data;
  },
};
