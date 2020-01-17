export default {
  id: 'threeOneOneCarto',
  type: 'http-get-nearby',
  url: 'https://phl.carto.com/api/v2/sql',
  options: {
    table: 'public_cases_fc',
    dateMinNum: 1,
    dateMinType: 'year',
    dateField: 'requested_datetime',
  },
};
